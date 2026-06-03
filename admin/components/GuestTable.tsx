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
  selectedIds?: Set<number>;
  onToggleId?: (id: number) => void;
  onToggleAll?: (ids: number[], selectAll: boolean) => void;
  duplicateIds?: Set<number>;
};

const PAGE_SIZE = 50;

function resolveStatus(r: Rsvp) {
  if (r.status) return r.status;
  if (r.attending === 'yes') return 'Confirmed';
  if (r.attending === 'no')  return 'Declined';
  return 'Pending';
}

export default function GuestTable({ data, onSelect, onFilteredChange, statusFilter, selectedIds, onToggleId, onToggleAll, duplicateIds }: Props) {
  const { t } = useLang();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAtt, setFilterAtt]       = useState('all');
  const [filterPref, setFilterPref]     = useState('all');
  const [filterSide, setFilterSide]     = useState('all');
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
      (filterPref === 'all'   || r.pref === filterPref) &&
      (filterSide === 'all'   || r.side === filterSide)
    );
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onFilteredChange(filtered); }, [filtered.length, data.length]);

  const isPendingView = filterStatus === 'Pending';
  const sorted = isPendingView
    ? [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : filtered;

  const now = Date.now();
  const daysSince = (iso: string) => Math.floor((now - new Date(iso).getTime()) / 86_400_000);

  const pages = Math.ceil(sorted.length / PAGE_SIZE);
  const rows  = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const reset = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { fn(e.target.value); setPage(0); };

  const allOnPageSelected = onToggleId !== undefined && rows.length > 0 && rows.every(r => selectedIds?.has(r.id));
  const someOnPageSelected = onToggleId !== undefined && rows.some(r => selectedIds?.has(r.id));

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
        <select value={filterSide} onChange={reset(setFilterSide)} style={selStyle}>
          <option value="all">{t.filterAllSides}</option>
          <option value="groom">{t.sideGroom}</option>
          <option value="bride">{t.sideBride}</option>
        </select>
        {isPendingView && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#EA580C', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 6, padding: '0 8px', height: 36, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            ⏳ {t.pendingOldest}
          </span>
        )}
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
                  {onToggleId && (
                    <th style={{ padding: '10px 6px 10px 14px', width: 36, borderBottom: '1px solid var(--line)' }}>
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        ref={el => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected; }}
                        onChange={() => onToggleAll?.(rows.map(r => r.id), !allOnPageSelected)}
                        style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--green)' }}
                      />
                    </th>
                  )}
                  {[t.colNum, t.colName, t.colPhone, t.colGuests, t.colMeal, t.colAttending, t.colStatus, t.colSide, t.colSubmitted].map(h => (
                    <th key={h} style={{
                      textAlign: 'start', fontSize: 11, fontWeight: 600,
                      color: 'var(--ink-soft)', textTransform: 'uppercase',
                      letterSpacing: '0.05em', padding: '10px 14px',
                      borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-ui)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isChecked = selectedIds?.has(r.id) ?? false;
                  return (
                  <tr key={r.id} onClick={() => onSelect(r)}
                    style={{ cursor: 'pointer', transition: 'background 0.1s', borderBottom: '1px solid var(--line)', background: isChecked ? 'rgba(79,107,82,0.07)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = isChecked ? 'rgba(79,107,82,0.12)' : 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isChecked ? 'rgba(79,107,82,0.07)' : 'transparent')}>
                    {onToggleId && (
                      <td style={{ padding: '11px 6px 11px 14px', width: 36 }}
                        onClick={e => { e.stopPropagation(); onToggleId(r.id); }}>
                        <input type="checkbox" checked={isChecked} onChange={() => {}}
                          style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--green)', pointerEvents: 'none' }} />
                      </td>
                    )}
                    <td style={{ padding: '11px 14px', color: 'var(--ink-muted)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{page * PAGE_SIZE + i + 1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--ink)' }}>{r.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>
                      {r.phone}
                      {duplicateIds?.has(r.id) && <span title={t.duplicatePhoneWarning} style={{ marginInlineStart: 5, color: '#DC2626', fontSize: 12 }}>⚠</span>}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 500 }}>{r.guests}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-soft)' }}>{PREF_LABELS[r.pref] ?? r.pref}</td>
                    <td style={{ padding: '11px 14px', color: r.attending === 'yes' ? '#16A34A' : r.attending === 'no' ? '#DC2626' : 'var(--ink-muted)', fontWeight: 500 }}>
                      {r.attending === 'yes' ? t.attendingYes : r.attending === 'no' ? t.attendingNo : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={r.status} attending={r.attending} /></td>
                    <td style={{ padding: '11px 14px' }}>
                      {r.side === 'groom' ? (
                        <span style={{ padding: '2px 8px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.sideGroom}</span>
                      ) : r.side === 'bride' ? (
                        <span style={{ padding: '2px 8px', background: '#FCE7F3', color: '#BE185D', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.sideBride}</span>
                      ) : (
                        <span style={{ color: 'var(--ink-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--ink-muted)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                      {resolveStatus(r) === 'Pending' && (
                        <span style={{ marginInlineStart: 6, padding: '1px 5px', background: '#FFF7ED', color: '#EA580C', borderRadius: 4, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {t.daysAgo(daysSince(r.created_at))}
                        </span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'var(--cream-deep)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{sorted.length} {t.results}</span>
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', direction: 'ltr' }}>
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
