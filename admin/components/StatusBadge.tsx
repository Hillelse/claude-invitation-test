type Props = { status?: string | null; attending?: string };

const BADGE: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  Confirmed: { label: 'Confirmed', bg: '#DCFCE7', color: '#15803D', dot: '#16A34A' },
  Declined:  { label: 'Declined',  bg: '#FEE2E2', color: '#B91C1C', dot: '#DC2626' },
  Pending:   { label: 'Pending',   bg: '#FFF7ED', color: '#C2410C', dot: '#EA580C' },
};

function resolve(status?: string | null, attending?: string) {
  if (status && BADGE[status]) return status;
  if (attending === 'yes') return 'Confirmed';
  if (attending === 'no')  return 'Declined';
  return 'Pending';
}

export default function StatusBadge({ status, attending }: Props) {
  const key = resolve(status, attending);
  const b = BADGE[key];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 6,
      fontSize: 12, fontWeight: 500,
      background: b.bg, color: b.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.dot, flexShrink: 0 }} />
      {b.label}
    </span>
  );
}
