'use client';
import { Rsvp } from '@/lib/supabase';
import { useLang } from '@/app/providers';

type Props = {
  data: Rsvp[];
  activeStatus?: string | null;
  onStatusClick?: (status: string | null) => void;
};

function resolveStatus(r: Rsvp) {
  if (r.status) return r.status;
  if (r.attending === 'yes') return 'Confirmed';
  if (r.attending === 'no')  return 'Declined';
  return 'Pending';
}

export default function SummaryBar({ data, activeStatus, onStatusClick }: Props) {
  const { t } = useLang();
  const confirmed = data.filter(r => resolveStatus(r) === 'Confirmed').reduce((s, r) => s + (r.guests || 1), 0);
  const declined  = data.filter(r => resolveStatus(r) === 'Declined').reduce((s, r) => s + (r.guests || 1), 0);
  const pending   = data.filter(r => resolveStatus(r) === 'Pending').reduce((s, r) => s + (r.guests || 1), 0);

  const cards = [
    { label: t.totalRsvps, value: data.reduce((s, r) => s + (r.guests || 1), 0), accent: 'var(--green)',     bg: 'rgba(79,107,82,0.08)', filter: null },
    { label: t.confirmed,  value: confirmed,   accent: '#16A34A',           bg: '#F0FDF4',              filter: 'Confirmed' },
    { label: t.declined,   value: declined,    accent: '#DC2626',           bg: '#FEF2F2',              filter: 'Declined' },
    { label: t.pending,    value: pending,     accent: '#EA580C',           bg: '#FFF7ED',              filter: 'Pending' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
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
  );
}
