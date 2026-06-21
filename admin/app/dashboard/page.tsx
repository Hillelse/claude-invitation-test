'use client';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { supabase, Rsvp, DB_READONLY } from '@/lib/supabase';
import { useHistory } from '@/lib/useHistory';
import SummaryBar from '@/components/SummaryBar';
import GuestTable from '@/components/GuestTable';
import GuestDetailPanel from '@/components/GuestDetailPanel';
import AddGuestModal from '@/components/AddGuestModal';
import BroadcastModal from '@/components/BroadcastModal';
import ImportPreviewModal, { PreviewRow } from '@/components/ImportPreviewModal';
import Toast, { ToastMsg } from '@/components/Toast';
import { useLang } from '@/app/providers';
import { normalizePhone } from '@/lib/validation';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const { t } = useLang();
  const { data: session } = useSession();
  const hist = useHistory();
  const [data, setData]             = useState<Rsvp[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Rsvp | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [toasts, setToasts]         = useState<ToastMsg[]>([]);
  const [live, setLive]             = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sideFilter, setSideFilter]     = useState<string | null>(null);
  const [mealFilter, setMealFilter]     = useState<string | null>(null);
  const [bulkIds, setBulkIds]       = useState<Set<number>>(new Set());
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [importPreview, setImportPreview] = useState<PreviewRow[] | null>(null);
  const filteredRef                 = useRef<Rsvp[]>([]);
  const importRef                   = useRef<HTMLInputElement>(null);

  const toast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToasts(ts => [...ts, { id: Date.now(), text, type }]);
  }, []);
  const removeToast = useCallback((id: number) => setToasts(ts => ts.filter(x => x.id !== id)), []);

  useEffect(() => {
    supabase.from('rsvp').select('*').order('created_at', { ascending: false })
      .then(({ data: rows, error }) => {
        if (error) toast(error.message, 'error');
        else setData(rows as Rsvp[]);
        setLoading(false);
      });

    const channel = supabase
      .channel('rsvp-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rsvp' }, ({ new: row }) => {
        setData(d => [row as Rsvp, ...d.filter(r => r.id !== (row as Rsvp).id)]);
        toast(t.newRsvp);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rsvp' }, ({ new: row }) => {
        setData(d => d.map(r => r.id === (row as Rsvp).id ? row as Rsvp : r));
        setSelected(sel => sel?.id === (row as Rsvp).id ? row as Rsvp : sel);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rsvp' }, ({ old: row }) => {
        setData(d => d.filter(r => r.id !== (row as { id: number }).id));
        setSelected(sel => sel?.id === (row as { id: number }).id ? null : sel);
      })
      .subscribe(status => setLive(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const duplicateIds = useMemo(() => {
    const phoneMap = new Map<string, number[]>();
    data.forEach(r => {
      const norm = normalizePhone(r.phone);
      if (!phoneMap.has(norm)) phoneMap.set(norm, []);
      phoneMap.get(norm)!.push(r.id);
    });
    const ids = new Set<number>();
    phoneMap.forEach(list => { if (list.length > 1) list.forEach(id => ids.add(id)); });
    return ids;
  }, [data]);

  const handleFiltered = useCallback((rows: Rsvp[]) => { filteredRef.current = rows; }, []);

  // ---- Central mutation layer (all writes flow through here so they're undoable) ----
  const logAudit = async (rsvpId: number, summary: string) => {
    await supabase.from('rsvp_audit').insert({ rsvp_id: rsvpId, changed_by: session?.user?.name ?? 'admin', summary });
  };

  // Patch one guest: DB write + optional audit + local state. Returns success.
  const applyPatch = async (id: number, patch: Partial<Rsvp>, summary?: string): Promise<boolean> => {
    const { error } = await supabase.from('rsvp').update(patch).eq('id', id);
    if (error) { toast(error.message, 'error'); return false; }
    if (summary) await logAudit(id, summary);
    setData(d => d.map(r => r.id === id ? { ...r, ...patch } : r));
    setSelected(sel => sel && sel.id === id ? { ...sel, ...patch } : sel);
    return true;
  };

  const insertRow = async (payload: Partial<Rsvp>): Promise<Rsvp | null> => {
    const { data: row, error } = await supabase.from('rsvp').insert(payload).select().single();
    if (error) { toast(error.message, 'error'); return null; }
    const r = row as Rsvp;
    setData(d => [r, ...d.filter(x => x.id !== r.id)]);
    return r;
  };

  const deleteRow = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('rsvp').delete().eq('id', id);
    if (error) { toast(error.message, 'error'); return false; }
    setData(d => d.filter(r => r.id !== id));
    setSelected(sel => sel && sel.id === id ? null : sel);
    return true;
  };

  // Edit a guest (quick action or panel save) — records inverse for undo.
  const mutateGuest = async (prev: Rsvp, patch: Partial<Rsvp>, summary: string): Promise<boolean> => {
    const prevVals: Partial<Rsvp> = {};
    (Object.keys(patch) as (keyof Rsvp)[]).forEach(k => { (prevVals as Record<string, unknown>)[k] = prev[k]; });
    const ok = await applyPatch(prev.id, patch, summary);
    if (!ok) return false;
    hist.record({
      label: t.undoEdit,
      undo: () => applyPatch(prev.id, prevVals, `${t.auditUndo} · ${summary}`),
      redo: () => applyPatch(prev.id, patch, summary),
    });
    return true;
  };

  const addGuest = async (payload: Partial<Rsvp>): Promise<Rsvp | null> => {
    const row = await insertRow(payload);
    if (!row) return null;
    await logAudit(row.id, t.auditAdded);
    let cur = row;
    hist.record({
      label: t.undoAdd,
      undo: () => deleteRow(cur.id),
      redo: async () => { const r = await insertRow(payload); if (r) { cur = r; await logAudit(r.id, t.auditAdded); } return !!r; },
    });
    return row;
  };

  const deleteGuest = async (guest: Rsvp): Promise<boolean> => {
    const ok = await deleteRow(guest.id);
    if (!ok) return false;
    let cur = guest;
    hist.record({
      label: t.undoDelete,
      undo: async () => { const { id: _id, created_at: _c, ...rest } = cur; void _id; void _c; const r = await insertRow(rest); if (r) cur = r; return !!r; },
      redo: () => deleteRow(cur.id),
    });
    return true;
  };

  const toggleBulkId  = useCallback((id: number) => setBulkIds(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; }), []);
  const toggleBulkAll = useCallback((ids: number[], selectAll: boolean) => setBulkIds(prev => { const n = new Set(prev); ids.forEach(id => { if (selectAll) { n.add(id); } else { n.delete(id); } }); return n; }), []);

  // Bulk field change with per-row previous-value capture for undo.
  const bulkPatch = async (patch: Partial<Rsvp>, doneMsg: string) => {
    setBulkSaving(true);
    const ids = Array.from(bulkIds);
    const prev = data.filter(r => bulkIds.has(r.id)).map(r => {
      const v: Partial<Rsvp> = {};
      (Object.keys(patch) as (keyof Rsvp)[]).forEach(k => { (v as Record<string, unknown>)[k] = r[k]; });
      return { id: r.id, v };
    });
    const { error } = await supabase.from('rsvp').update(patch).in('id', ids);
    if (error) { toast(error.message, 'error'); setBulkSaving(false); return; }
    setData(d => d.map(r => ids.includes(r.id) ? { ...r, ...patch } : r));
    hist.record({
      label: t.undoBulk,
      undo: async () => { for (const p of prev) await supabase.from('rsvp').update(p.v).eq('id', p.id); setData(d => d.map(r => { const f = prev.find(x => x.id === r.id); return f ? { ...r, ...f.v } : r; })); return true; },
      redo: async () => { await supabase.from('rsvp').update(patch).in('id', ids); setData(d => d.map(r => ids.includes(r.id) ? { ...r, ...patch } : r)); return true; },
    });
    toast(doneMsg); setBulkIds(new Set()); setBulkSaving(false);
  };

  const handleBulkConfirm = () => bulkPatch({ status: 'Confirmed' }, t.bulkConfirmed(bulkIds.size));
  const handleBulkDecline = () => bulkPatch({ status: 'Declined' }, t.bulkDeclined(bulkIds.size));
  const handleBulkLang    = (lang: 'he' | 'fr' | 'both') => bulkPatch({ lang }, t.bulkLangSet(bulkIds.size));

  const handleBulkDelete = async () => {
    setBulkSaving(true);
    const ids = Array.from(bulkIds);
    let rows = data.filter(r => bulkIds.has(r.id));
    const { error } = await supabase.from('rsvp').delete().in('id', ids);
    if (error) { toast(error.message, 'error'); setBulkSaving(false); return; }
    setData(d => d.filter(r => !bulkIds.has(r.id)));
    hist.record({
      label: t.undoDelete,
      undo: async () => {
        const payloads = rows.map(({ id: _i, created_at: _c, ...rest }) => { void _i; void _c; return rest; });
        const { data: ins } = await supabase.from('rsvp').insert(payloads).select();
        const nw = (ins ?? []) as Rsvp[];
        if (nw.length) { rows = nw; setData(d => [...nw, ...d]); }
        return nw.length > 0;
      },
      redo: async () => { const cur = rows.map(r => r.id); await supabase.from('rsvp').delete().in('id', cur); setData(d => d.filter(r => !cur.includes(r.id))); return true; },
    });
    toast(t.bulkDeleted(ids.length));
    setBulkIds(new Set()); setConfirmBulkDel(false); setBulkSaving(false);
  };

  // Quick action from a table row — build patch + summary, route through mutateGuest.
  const handleQuickMutate = (guest: Rsvp, patch: Partial<Rsvp>, summary: string) => mutateGuest(guest, patch, summary);

  const runUndo = useCallback(async () => { const op = await hist.undo(); if (op) toast(`${t.undo}: ${op.label}`); else toast(t.nothingToUndo); }, [hist, t, toast]);
  const runRedo = useCallback(async () => { const op = await hist.redo(); if (op) toast(`${t.redo}: ${op.label}`); else toast(t.nothingToRedo); }, [hist, t, toast]);

  // Keyboard: Ctrl/Cmd+Z = undo, Ctrl+Shift+Z / Ctrl+Y = redo. Skip while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); void runUndo(); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); void runRedo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runUndo, runRedo]);

  const importXlsx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      const norm = (v: unknown) => String(v ?? '').trim();
      // Normalize a header: strip accents (téléphone→telephone), spaces, lowercase.
      const hkey = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s/g, '').toLowerCase();
      // Match columns by EXACT header first, then substring. Exact-first prevents
      // 'nom' (name) from grabbing the 'nombre' (count) column.
      const findVal = (row: Record<string, unknown>, ...keys: string[]) => {
        const cols = Object.keys(row);
        for (const k of keys) { const col = cols.find(c => hkey(c) === hkey(k)); if (col !== undefined) return norm(row[col]); }
        for (const k of keys) { const col = cols.find(c => hkey(c).includes(hkey(k))); if (col !== undefined) return norm(row[col]); }
        return '';
      };
      const parsed = rows.map(row => {
        const rawPref = findVal(row, 'pref', 'meal', 'repas', 'תפריט').toLowerCase();
        const pref = ['vegan', 'kosher', 'regular'].includes(rawPref) ? rawPref : 'regular';
        const rawAtt = findVal(row, 'attending', 'présence', 'הגעה', 'rsvp').toLowerCase();
        const attending = rawAtt === 'yes' || rawAtt === 'oui' || rawAtt === 'כן' ? 'yes'
          : rawAtt === 'no' || rawAtt === 'non' || rawAtt === 'לא' ? 'no' : 'pending';
        const rawPhone = findVal(row, 'phone', 'téléphone', 'telephone', 'טלפון', 'mobile', 'נייד', 'tel', 'cellulaire');
        // Side / côté — map FR/HE/EN tokens. Test bride first ('mariée' contains 'marié').
        const rawSide = hkey(findVal(row, 'side', 'côté', 'cote', 'camp', 'צד'));
        const side: 'groom' | 'bride' | null =
          /(bride|mariee|femme|epouse|כלה)/.test(rawSide) ? 'bride' :
          /(groom|marie|mari|homme|חתן)/.test(rawSide)   ? 'groom' : null;
        return {
          name: findVal(row, 'name', 'noms', 'nom', 'שם', 'fullname', 'שםמלא'),
          phone: rawPhone,
          normPhone: normalizePhone(rawPhone),
          guests: Number(findVal(row, 'guests', 'nombre', 'אורחים', 'כמות', 'מספר', 'invités', 'nbguests', 'number', 'nb')) || 1,
          pref, attending, side, isDuplicate: false,
        };
      }).filter(r => r.name && r.phone);
      if (!parsed.length) { toast('No valid rows found', 'error'); return; }
      const { data: existing } = await supabase.from('rsvp').select('phone');
      const existingPhones = new Set((existing ?? []).map((r: { phone: string }) => normalizePhone(r.phone)));
      const preview: PreviewRow[] = parsed.map(r => ({ ...r, isDuplicate: existingPhones.has(r.normPhone) }));
      setImportPreview(preview);
    };
    reader.readAsBinaryString(file);
  };

  const doImport = async (rows: PreviewRow[]) => {
    setImportPreview(null);
    if (!rows.length) return;
    const records = rows.map(r => ({
      name: r.name, phone: r.normPhone, guests: r.guests,
      attending: r.attending, pref: r.pref, side: r.side,
      status: r.attending === 'yes' ? 'Confirmed' : r.attending === 'no' ? 'Declined' : 'Pending',
      notes: null as null, internal_notes: null as null,
    }));
    const { data: inserted, error } = await supabase.from('rsvp').insert(records).select();
    if (error) { toast(error.message, 'error'); return; }
    let added = inserted as Rsvp[];
    setData(d => [...added, ...d]);
    await supabase.from('rsvp_audit').insert(added.map(r => ({ rsvp_id: r.id, changed_by: 'import', summary: t.auditImported })));
    hist.record({
      label: t.undoImport,
      undo: async () => { const ids = added.map(r => r.id); await supabase.from('rsvp').delete().in('id', ids); setData(d => d.filter(r => !ids.includes(r.id))); return true; },
      redo: async () => { const { data: ins } = await supabase.from('rsvp').insert(records).select(); const nw = (ins ?? []) as Rsvp[]; if (nw.length) { added = nw; setData(d => [...nw, ...d]); } return nw.length > 0; },
    });
    toast(t.importDone(added.length, 0));
  };

  const exportXlsx = () => {
    const source = filteredRef.current.length > 0 ? filteredRef.current : data;
    const rows = source.map((r, i) => ({
      '#': i + 1,
      [t.fieldName]: r.name,
      [t.fieldPhone]: r.phone,
      [t.fieldGuests]: r.guests,
      [t.fieldMeal]: r.pref,
      [t.fieldAttending]: r.attending === 'yes' ? t.filterYes : t.filterNo,
      [t.fieldStatus]: r.status ?? '',
      [t.fieldMessage]: r.notes ?? '',
      [t.fieldInternalNotes]: r.internal_notes ?? '',
      [t.fieldSubmitted]: new Date(r.created_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RSVPs');
    XLSX.writeFile(wb, `rsvp_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast(t.exported(rows.length));
  };

  const btn = (primary = false): React.CSSProperties => ({
    padding: '9px 18px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
    letterSpacing: '0.08em', border: primary ? 'none' : '1px solid var(--line)',
    background: primary ? 'var(--green-deep)' : 'rgba(255,255,255,0.6)',
    color: primary ? '#fff' : 'var(--ink)', transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
  });

  return (
    <>
      {DB_READONLY && (
        <div style={{ marginBottom: 16, padding: '8px 14px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
          🧪 DEV (localhost) — changes are NOT saved to the live database. Safe to test freely.
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--ink)' }}>{t.pageTitle}</h1>
            <span title={live ? 'Live' : 'Connecting...'} style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: live ? '#22c55e' : '#f59e0b', boxShadow: live ? '0 0 6px #22c55e' : 'none', transition: 'background 0.5s' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4, letterSpacing: '0.12em' }}>{t.pageDate}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={runUndo} disabled={!hist.canUndo || hist.busy} title={hist.canUndo ? `${t.undo}: ${hist.nextUndoLabel}` : t.undo}
            style={{ ...btn(), padding: '9px 14px', opacity: !hist.canUndo || hist.busy ? 0.4 : 1, cursor: !hist.canUndo || hist.busy ? 'not-allowed' : 'pointer' }}>↶ {t.undo}</button>
          <button onClick={runRedo} disabled={!hist.canRedo || hist.busy} title={hist.canRedo ? `${t.redo}: ${hist.nextRedoLabel}` : t.redo}
            style={{ ...btn(), padding: '9px 14px', opacity: !hist.canRedo || hist.busy ? 0.4 : 1, cursor: !hist.canRedo || hist.busy ? 'not-allowed' : 'pointer' }}>↷ {t.redo}</button>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={importXlsx} />
          <button onClick={() => importRef.current?.click()} style={btn()}>{t.import}</button>
          <button onClick={exportXlsx} style={btn()}>{t.export}</button>
          <button onClick={() => setShowBroadcast(true)} style={{ ...btn(), background: '#25D366', color: '#fff', border: 'none' }}>{t.broadcastBtn}</button>
          <button onClick={() => setShowAdd(true)} style={btn(true)}>{t.addGuest}</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-soft)', fontSize: 13, letterSpacing: '0.2em' }}>{t.loading}</div>
      ) : (
        <>
          <SummaryBar data={data} activeStatus={statusFilter} onStatusClick={(s) => { setStatusFilter(s); setBulkIds(new Set()); }} activeSide={sideFilter} onSideClick={(s) => { setSideFilter(s); setBulkIds(new Set()); }}
            activeMeal={mealFilter} onMealClick={(m) => { setMealFilter(m); setStatusFilter(m ? 'Confirmed' : null); setBulkIds(new Set()); }} />

          {bulkIds.size > 0 && !confirmBulkDel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--green)', borderRadius: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-deep)', marginRight: 4 }}>{t.xSelected(bulkIds.size)}</span>
              <button onClick={handleBulkConfirm} disabled={bulkSaving} style={{ height: 30, padding: '0 12px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #86EFAC', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: bulkSaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>{t.bulkConfirm}</button>
              <button onClick={handleBulkDecline} disabled={bulkSaving} style={{ height: 30, padding: '0 12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: bulkSaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>{t.bulkDecline}</button>
              <button onClick={() => setConfirmBulkDel(true)} disabled={bulkSaving} style={{ height: 30, padding: '0 12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: bulkSaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>{t.bulkDelete}</button>
              <select disabled={bulkSaving} defaultValue="" onChange={e => { if (e.target.value) { handleBulkLang(e.target.value as 'he' | 'fr' | 'both'); e.target.value = ''; } }} style={{ height: 30, padding: '0 8px', background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: bulkSaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>
                <option value="">{t.bulkSetLangPlaceholder}</option>
                <option value="he">{t.langHe}</option>
                <option value="fr">{t.langFr}</option>
                <option value="both">{t.langBoth}</option>
              </select>
              <div style={{ flex: 1 }} />
              <button onClick={() => setBulkIds(new Set())} style={{ height: 28, width: 28, background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 16, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          )}

          {confirmBulkDel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#991B1B', fontWeight: 500, flex: 1 }}>{t.confirmBulkDelete(bulkIds.size)}</span>
              <button onClick={handleBulkDelete} disabled={bulkSaving} style={{ height: 30, padding: '0 14px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: bulkSaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>{t.yesDelete}</button>
              <button onClick={() => setConfirmBulkDel(false)} style={{ height: 30, padding: '0 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.cancel}</button>
            </div>
          )}

          <GuestTable data={data} onSelect={setSelected} onFilteredChange={handleFiltered} onQuickMutate={handleQuickMutate}
            statusFilter={statusFilter} sideFilter={sideFilter} onFilterSideChange={s => setSideFilter(s === 'all' ? null : s)}
            mealFilter={mealFilter} onFilterMealChange={m => setMealFilter(m === 'all' ? null : m)}
            selectedIds={bulkIds} onToggleId={toggleBulkId} onToggleAll={toggleBulkAll} duplicateIds={duplicateIds} />
        </>
      )}

      {selected && <GuestDetailPanel guest={selected} onClose={() => setSelected(null)} onSave={mutateGuest} onDelete={deleteGuest} toast={toast} isDuplicate={duplicateIds.has(selected.id)} />}
      {showAdd && <AddGuestModal onClose={() => setShowAdd(false)} onSubmit={addGuest} toast={toast} />}
      {showBroadcast && (
        <BroadcastModal
          recipients={bulkIds.size > 0 ? data.filter(r => bulkIds.has(r.id)) : (filteredRef.current.length > 0 ? filteredRef.current : data)}
          onClose={() => setShowBroadcast(false)}
          onMutate={mutateGuest}
        />
      )}
      {importPreview && <ImportPreviewModal rows={importPreview} onConfirm={doImport} onClose={() => setImportPreview(null)} />}
      <Toast toasts={toasts} remove={removeToast} />
    </>
  );
}
