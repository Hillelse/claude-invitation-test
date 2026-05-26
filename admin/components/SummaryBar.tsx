'use client';
import { Rsvp } from '@/lib/supabase';
import { useLang } from '@/app/providers';

type Props = { data: Rsvp[] };

function resolveStatus(r: Rsvp) {
  if (r.status) return r.status;
  if (r.attending === 'yes') return 'Confirmed';
  if (r.attending === 'no')  return 'Declined';
  return 'Pending';
}

export default function SummaryBar({ data }: Props) {
  const { t } = useLang();
  const confirmed   = data.filter(r => resolveStatus(r) === 'Confirmed').reduce((s, r) => s + (r.guests || 1), 0);
  const declined    = data.filter(r => resolveStatus(r) === 'Declined').length;
  const pending     = data.filter(r => resolveStatus(r) === 'Pending').length;

  const cards = [
    { label: t.totalRsvps,   value: data.length, accent: 'var(--green)',      bg: 'rgba(79,107,82,0.08)' },
    { label: t.confirmed,    value: confirmed,   accent: '#16A34A',            bg: '#F0FDF4' },
    { label: t.declined,     value: declined,    accent: '#DC2626',            bg: '#FEF2F2' },
    { label: t.pending,      value: pending,     accent: '#EA580C',            bg: '#FFF7ED' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 12, padding: '16px 18px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {c.label}
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, color: c.accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
}
