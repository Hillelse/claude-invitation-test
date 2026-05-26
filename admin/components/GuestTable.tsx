'use client';
import { useState, useEffect } from 'react';
import { Rsvp } from '@/lib/supabase';
import StatusBadge from './StatusBadge';
import { useLang } from '@/app/providers';

type Props = {
  data: Rsvp[];
  onSelect: (r: Rsvp) => void;
  onFilteredChange: (rows: Rsvp[]) => void;
  statusFilter?: string | null;
};

const PAGE_SIZE = 50;

function resolveStatus(r: Rsvp) {
  if (r.status) return r.status;
  if (r.attending === 'yes') return 'Confirmed';
  if (r.attending === 'no')  return 'Declined';
  return 'Pending';
}

export default function GuestTable({ data, onSelect, onFilteredChange, statusFilter }: Props) {
  const { t } = useLang();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAtt, setFilterAtt]       = useState('all');
  const [filterPref, setFilterPref]     = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    setFilterStatus(statusFilter ?? 'all');
    setPage(0);
  }, [statusFilter]);

  const PREF_LABELS: Record<string, string> = { regular: t.mealRegular, vegan: t.mealVegan, kosher: t.mealKosher };

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    return (
      (!q || r.name.toLowerCase().includes(q) || r.phone.includes(q)) &&
      (filterStatus === 'all' || resolveStatus(r) === filterStatus) &&
      (filterAtt === 'all'    || r.attending === filterAtt) &&
      (filterPref === 'all'   || r.pref === filterPref)
    );
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onFilteredChange(filtered); }, [filtered.length, data.length]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const reset = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { fn(e.target.value); setPage(0); };

  const selStyle: React.CSSProperties = {
    height: 36, padding: '0 12px', background: 'var(--surface)',
    border: '1px solid var(--line)', borderRadius: 8,
    fontSize: 13, color: 'var(--ink)', outline: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={reset(setSearch)}
            style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: 12, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-ui)' }}
          />
        </div>
        <select value={filterStatus} onChange={reset(setFilterStatus)} style={selStyle}>
          <option value="all">{t.filterAllStatuses}</option>
          <option value="Confirmed">{t.filterConfirmed}</option>
          <option value="Declined">{t.filterDeclined}</option>
          <option value="Pending">{t.filterPending}</option>
        </select>
        <select value={filterAtt} onChange={reset(setFilterAtt)} style={selStyle}>
          <option value="all">{t.filterAllAttending}</option>
          <option value="yes">{t.filterYes}</option>
          <option value="no">{t.filterNo}</option>
        </select>
        <select value={filterPref} onChange={reset(setFilterPref)} style={selStyle}>
          <option value="all">{t.filterAllMeals}</option>
          <option value="regular">{t.mealRegular}</option>
          <option value="vegan">{t.mealVegan}</option>
          <option value="kosher">{t.mealKosher}</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-soft)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💌</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{data.length === 0 ? t.noRsvps : t.noResults}</div>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--cream-deep)' }}>
                  {[t.colNum, t.colName, t.colPhone, t.colGuests, t.colMeal, t.colAttending, t.colStatus, t.colSubmitted].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', fontSize: 11, fontWeight: 600,
                      color: 'var(--ink-soft)', textTransform: 'uppercase',
                      letterSpacing: '0.05em', padding: '10px 14px',
                      borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-ui)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} onClick={() => onSelect(r)}
                    style={{ cursor: 'pointer', transition: 'background 0.1s', borderBottom: '1px solid var(--line)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-muted)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{page * PAGE_SIZE + i + 1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--ink)' }}>{r.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{r.phone}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 500 }}>{r.guests}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-soft)' }}>{PREF_LABELS[r.pref] ?? r.pref}</td>
                    <td style={{ padding: '11px 14px', color: r.attending === 'yes' ? '#16A34A' : r.attending === 'no' ? '#DC2626' : 'var(--ink-muted)', fontWeight: 500 }}>
                      {r.attending === 'yes' ? t.attendingYes : r.attending === 'no' ? t.attendingNo : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={r.status} attending={r.attending} /></td>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-muted)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'var(--cream-deep)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{filtered.length} {t.results}</span>
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  style={{ height: 28, padding: '0 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontFamily: 'var(--font-ui)' }}>{t.prev}</button>
                <span style={{ padding: '0 8px', fontSize: 12, color: 'var(--ink-soft)' }}>{page + 1} / {pages}</span>
                <button disabled={page === pages - 1} onClick={() => setPage(p => p + 1)}
                  style={{ height: 28, padding: '0 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: page === pages - 1 ? 'not-allowed' : 'pointer', opacity: page === pages - 1 ? 0.4 : 1, fontFamily: 'var(--font-ui)' }}>{t.next}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
