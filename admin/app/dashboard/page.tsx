'use client';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase, Rsvp, DB_READONLY } from '@/lib/supabase';
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
  const [data, setData]             = useState<Rsvp[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Rsvp | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [toasts, setToasts]         = useState<ToastMsg[]>([]);
  const [live, setLive]             = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sideFilter, setSideFilter]     = useState<string | null>(null);
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

  const handleUpdate   = (u: Rsvp)  => { setData(d => d.map(r => r.id === u.id ? u : r)); setSelected(u); };
  // Quick actions edit in-place from the table row — update data, keep an open panel
  // in sync, but never OPEN the panel (don't setSelected from null).
  const handleQuickUpdate = (u: Rsvp) => { setData(d => d.map(r => r.id === u.id ? u : r)); setSelected(sel => sel && sel.id === u.id ? u : sel); };
  const handleDelete   = (id: number) => setData(d => d.filter(r => r.id !== id));
  const handleAdded    = (r: Rsvp)   => setData(d => [r, ...d]);
  const handleFiltered = useCallback((rows: Rsvp[]) => { filteredRef.current = rows; }, []);
  const handleMessaged = useCallback((id: number, ts: string) => setData(d => d.map(r => r.id === id ? { ...r, messaged_at: ts } : r)), []);

  const toggleBulkId  = useCallback((id: number) => setBulkIds(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; }), []);
  const toggleBulkAll = useCallback((ids: number[], selectAll: boolean) => setBulkIds(prev => { const n = new Set(prev); ids.forEach(id => { if (selectAll) { n.add(id); } else { n.delete(id); } }); return n; }), []);

  const handleBulkConfirm = async () => {
    setBulkSaving(true);
    const ids = Array.from(bulkIds);
    const { error } = await supabase.from('rsvp').update({ status: 'Confirmed' }).in('id', ids);
    if (error) { toast(error.message, 'error'); setBulkSaving(false); return; }
    setData(d => d.map(r => bulkIds.has(r.id) ? { ...r, status: 'Confirmed' } : r));
    toast(t.bulkConfirmed(ids.length));
    setBulkIds(new Set()); setBulkSaving(false);
  };

  const handleBulkDecline = async () => {
    setBulkSaving(true);
    const ids = Array.from(bulkIds);
    const { error } = await supabase.from('rsvp').update({ status: 'Declined' }).in('id', ids);
    if (error) { toast(error.message, 'error'); setBulkSaving(false); return; }
    setData(d => d.map(r => bulkIds.has(r.id) ? { ...r, status: 'Declined' } : r));
    toast(t.bulkDeclined(ids.length));
    setBulkIds(new Set()); setBulkSaving(false);
  };

  const handleBulkLang = async (lang: 'he' | 'fr' | 'both') => {
    setBulkSaving(true);
    const ids = Array.from(bulkIds);
    const { error } = await supabase.from('rsvp').update({ lang }).in('id', ids);
    if (error) { toast(error.message, 'error'); setBulkSaving(false); return; }
    setData(d => d.map(r => bulkIds.has(r.id) ? { ...r, lang } : r));
    toast(t.bulkLangSet(ids.length));
    setBulkIds(new Set()); setBulkSaving(false);
  };

  const handleBulkDelete = async () => {
    setBulkSaving(true);
    const ids = Array.from(bulkIds);
    const { error } = await supabase.from('rsvp').delete().in('id', ids);
    if (error) { toast(error.message, 'error'); setBulkSaving(false); return; }
    setData(d => d.filter(r => !bulkIds.has(r.id)));
    toast(t.bulkDeleted(ids.length));
    setBulkIds(new Set()); setConfirmBulkDel(false); setBulkSaving(false);
  };

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
      const findVal = (row: Record<string, unknown>, ...keys: string[]) => {
        for (const k of keys) {
          const col = Object.keys(row).find(c => c.replace(/\s/g, '').toLowerCase().includes(k.toLowerCase()));
          if (col !== undefined) return norm(row[col]);
        }
        return '';
      };
      const parsed = rows.map(row => {
        const rawPref = findVal(row, 'pref', 'meal', 'repas', 'תפריט').toLowerCase();
        const pref = ['vegan', 'kosher', 'regular'].includes(rawPref) ? rawPref : 'regular';
        const rawAtt = findVal(row, 'attending', 'présence', 'הגעה', 'rsvp').toLowerCase();
        const attending = rawAtt === 'yes' || rawAtt === 'oui' || rawAtt === 'כן' ? 'yes'
          : rawAtt === 'no' || rawAtt === 'non' || rawAtt === 'לא' ? 'no' : 'pending';
        const rawPhone = findVal(row, 'phone', 'טלפון', 'mobile', 'נייד', 'tel', 'téléphone', 'cellulaire');
        return {
          name: findVal(row, 'name', 'שם', 'fullname', 'שםמלא', 'nom'),
          phone: rawPhone,
          normPhone: normalizePhone(rawPhone),
          guests: Number(findVal(row, 'guests', 'אורחים', 'כמות', 'מספר', 'invités', 'nb', 'number', 'nbguests', 'nombre')) || 1,
          pref, attending, isDuplicate: false,
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
      attending: r.attending, pref: r.pref,
      status: r.attending === 'yes' ? 'Confirmed' : r.attending === 'no' ? 'Declined' : 'Pending',
      notes: null as null, internal_notes: null as null,
    }));
    const { data: inserted, error } = await supabase.from('rsvp').insert(records).select();
    if (error) { toast(error.message, 'error'); return; }
    const added = inserted as Rsvp[];
    setData(d => [...added, ...d]);
    await supabase.from('rsvp_audit').insert(added.map(r => ({ rsvp_id: r.id, changed_by: 'import', summary: t.auditImported })));
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
          <SummaryBar data={data} activeStatus={statusFilter} onStatusClick={(s) => { setStatusFilter(s); setBulkIds(new Set()); }} activeSide={sideFilter} onSideClick={(s) => { setSideFilter(s); setBulkIds(new Set()); }} />

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

          <GuestTable data={data} onSelect={setSelected} onFilteredChange={handleFiltered} onQuickUpdate={handleQuickUpdate}
            statusFilter={statusFilter} sideFilter={sideFilter} onFilterSideChange={s => setSideFilter(s === 'all' ? null : s)}
            selectedIds={bulkIds} onToggleId={toggleBulkId} onToggleAll={toggleBulkAll} duplicateIds={duplicateIds} />
        </>
      )}

      {selected && <GuestDetailPanel guest={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} toast={toast} isDuplicate={duplicateIds.has(selected.id)} />}
      {showAdd && <AddGuestModal onClose={() => setShowAdd(false)} onAdded={handleAdded} toast={toast} />}
      {showBroadcast && (
        <BroadcastModal
          recipients={bulkIds.size > 0 ? data.filter(r => bulkIds.has(r.id)) : (filteredRef.current.length > 0 ? filteredRef.current : data)}
          onClose={() => setShowBroadcast(false)}
          onMessaged={handleMessaged}
          onLangChange={(id, lang) => setData(d => d.map(r => r.id === id ? { ...r, lang } : r))}
          toast={toast}
        />
      )}
      {importPreview && <ImportPreviewModal rows={importPreview} onConfirm={doImport} onClose={() => setImportPreview(null)} />}
      <Toast toasts={toasts} remove={removeToast} />
    </>
  );
}
