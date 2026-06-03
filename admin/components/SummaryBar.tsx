'use client';
import { Rsvp } from '@/lib/supabase';
import { useLang } from '@/app/providers';

type Props = {
  data: Rsvp[];
  activeStatus?: string | null;
  onStatusClick?: (status: string | null) => void;
  activeSide?: string | null;
  onSideClick?: (side: string | null) => void;
};

function resolveStatus(r: Rsvp) {
  if (r.status) return r.status;
  if (r.attending === 'yes') return 'Confirmed';
  if (r.attending === 'no')  return 'Declined';
  return 'Pending';
}

export default function SummaryBar({ data, activeStatus, onStatusClick, activeSide, onSideClick }: Props) {
  const { t } = useLang();
  const confirmedRows = data.filter(r => resolveStatus(r) === 'Confirmed');
  const confirmed = confirmedRows.reduce((s, r) => s + (r.guests || 1), 0);
  const declined  = data.filter(r => resolveStatus(r) === 'Declined').reduce((s, r) => s + (r.guests || 1), 0);
  const pending   = data.filter(r => resolveStatus(r) === 'Pending').reduce((s, r) => s + (r.guests || 1), 0);

  const regular = confirmedRows.filter(r => r.pref === 'regular').reduce((s, r) => s + (r.guests || 1), 0);
  const vegan   = confirmedRows.filter(r => r.pref === 'vegan').reduce((s, r) => s + (r.guests || 1), 0);
  const kosher  = confirmedRows.filter(r => r.pref === 'kosher').reduce((s, r) => s + (r.guests || 1), 0);

  const groomCount    = data.filter(r => r.side === 'groom').reduce((s, r) => s + (r.guests || 1), 0);
  const brideCount    = data.filter(r => r.side === 'bride').reduce((s, r) => s + (r.guests || 1), 0);
  const untaggedCount = data.filter(r => !r.side).reduce((s, r) => s + (r.guests || 1), 0);

  const cards = [
    { label: t.totalRsvps, value: data.reduce((s, r) => s + (r.guests || 1), 0), accent: 'var(--green)',     bg: 'rgba(79,107,82,0.08)', filter: null },
    { label: t.confirmed,  value: confirmed,   accent: '#16A34A',           bg: '#F0FDF4',              filter: 'Confirmed' },
    { label: t.declined,   value: declined,    accent: '#DC2626',           bg: '#FEF2F2',              filter: 'Declined' },
    { label: t.pending,    value: pending,     accent: '#EA580C',           bg: '#FFF7ED',              filter: 'Pending' },
  ];

  const mealCards = [
    { label: t.mealRegular, value: regular, accent: '#4F6B52' },
    { label: t.mealVegan,   value: vegan,   accent: '#0891B2' },
    { label: t.mealKosher,  value: kosher,  accent: '#7C3AED' },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 10 }}>
        {cards.map(c => {
          const isActive = activeStatus === c.filter || (c.filter === null && activeStatus === null);
          return (
            <div key={c.label} onClick={() => onStatusClick?.(isActive && c.filter !== null ? null : c.filter)}
              style={{
                background: isActive ? c.bg : 'var(--surface)',
                border: `1px solid ${isActive ? c.accent : 'var(--line)'}`,
                borderRadius: 12, padding: '16px 18px',
                display: 'flex', flexDirection: 'column', gap: 4,
                cursor: onStatusClick ? 'pointer' : 'default',
                transition: 'border-color 0.15s, background 0.15s',
              }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: isActive ? c.accent : 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {c.label}
              </span>
              <span style={{ fontSize: 28, fontWeight: 700, color: c.accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                {c.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Catering breakdown — confirmed guests only */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginInlineEnd: 6, whiteSpace: 'nowrap' }}>
          🍽 {t.confirmed}
        </span>
        {mealCards.map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--cream-deep)', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{m.label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: m.accent, fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Side breakdown */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginInlineEnd: 6, whiteSpace: 'nowrap' }}>
          👥 {t.fieldSide}
        </span>
        <div onClick={() => onSideClick?.(activeSide === 'groom' ? null : 'groom')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#DBEAFE', borderRadius: 6, cursor: onSideClick ? 'pointer' : 'default', border: activeSide === 'groom' ? '2px solid #1D4ED8' : '2px solid transparent', transition: 'border-color 0.15s' }}>
          <span style={{ fontSize: 11, color: '#1D4ED8' }}>{t.sideGroom}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>{groomCount}</span>
        </div>
        <div onClick={() => onSideClick?.(activeSide === 'bride' ? null : 'bride')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#FCE7F3', borderRadius: 6, cursor: onSideClick ? 'pointer' : 'default', border: activeSide === 'bride' ? '2px solid #BE185D' : '2px solid transparent', transition: 'border-color 0.15s' }}>
          <span style={{ fontSize: 11, color: '#BE185D' }}>{t.sideBride}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#BE185D', fontVariantNumeric: 'tabular-nums' }}>{brideCount}</span>
        </div>
        {untaggedCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--cream-deep)', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{t.sideUntagged}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>{untaggedCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
