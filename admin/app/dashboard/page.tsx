'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, Rsvp } from '@/lib/supabase';
import SummaryBar from '@/components/SummaryBar';
import GuestTable from '@/components/GuestTable';
import GuestDetailPanel from '@/components/GuestDetailPanel';
import AddGuestModal from '@/components/AddGuestModal';
import Toast, { ToastMsg } from '@/components/Toast';
import { useLang } from '@/app/providers';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const { t } = useLang();
  const [data, setData]         = useState<Rsvp[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Rsvp | null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [toasts, setToasts]     = useState<ToastMsg[]>([]);
  const [live, setLive]         = useState(false);
  const filteredRef             = useRef<Rsvp[]>([]);

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

  const handleUpdate   = (u: Rsvp)  => { setData(d => d.map(r => r.id === u.id ? u : r)); setSelected(u); };
  const handleDelete   = (id: number) => setData(d => d.filter(r => r.id !== id));
  const handleAdded    = (r: Rsvp)   => setData(d => [r, ...d]);
  const handleFiltered = useCallback((rows: Rsvp[]) => { filteredRef.current = rows; }, []);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--ink)' }}>{t.pageTitle}</h1>
            <span title={live ? 'Live' : 'Connecting...'} style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: live ? '#22c55e' : '#f59e0b', boxShadow: live ? '0 0 6px #22c55e' : 'none', transition: 'background 0.5s' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4, letterSpacing: '0.12em' }}>{t.pageDate}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={exportXlsx} style={btn()}>{t.export}</button>
          <button onClick={() => setShowAdd(true)} style={btn(true)}>{t.addGuest}</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-soft)', fontSize: 13, letterSpacing: '0.2em' }}>{t.loading}</div>
      ) : (
        <>
          <SummaryBar data={data} />
          <GuestTable data={data} onSelect={setSelected} onFilteredChange={handleFiltered} />
        </>
      )}

      {selected && <GuestDetailPanel guest={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} toast={toast} />}
      {showAdd && <AddGuestModal onClose={() => setShowAdd(false)} onAdded={handleAdded} toast={toast} />}
      <Toast toasts={toasts} remove={removeToast} />
    </>
  );
}
