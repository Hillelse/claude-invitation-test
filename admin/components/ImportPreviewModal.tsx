'use client';
import { useState } from 'react';
import { useLang } from '@/app/providers';

export type PreviewRow = {
  name: string;
  phone: string;
  normPhone: string;
  guests: number;
  pref: string;
  attending: string;
  side: 'groom' | 'bride' | null;
  isDuplicate: boolean;
};

type Props = {
  rows: PreviewRow[];
  onConfirm: (rows: PreviewRow[]) => void;
  onClose: () => void;
};

export default function ImportPreviewModal({ rows, onConfirm, onClose }: Props) {
  const { t } = useLang();
  const [filterPref, setFilterPref]   = useState('all');
  const [filterAtt, setFilterAtt]     = useState('all');
  const [showDups, setShowDups]       = useState(false);

  const PREF_LABELS: Record<string, string> = { regular: t.mealRegular, vegan: t.mealVegan, kosher: t.mealKosher };
  const ATT_LABELS: Record<string, string>  = { yes: t.filterYes, no: t.filterNo, pending: '—' };

  const visible = rows.filter(r =>
    (showDups || !r.isDuplicate) &&
    (filterPref === 'all' || r.pref === filterPref) &&
    (filterAtt  === 'all' || r.attending === filterAtt)
  );
  const toImport = visible.filter(r => !r.isDuplicate);
  const dupCount = rows.filter(r => r.isDuplicate).length;

  const chipStyle = (active: boolean): React.CSSProperties => ({
    height: 30, padding: '0 11px', borderRadius: 6, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: active ? 'none' : '1px solid var(--line)',
    background: active ? 'var(--green)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--ink-soft)',
    fontFamily: 'var(--font-ui)',
  });

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: 680, maxHeight: '85vh',
        background: 'var(--cream)', borderRadius: 16, zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{t.importPreviewTitle}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {(['all', 'regular', 'vegan', 'kosher'] as const).map(v => (
              <button key={v} onClick={() => setFilterPref(v)} style={chipStyle(filterPref === v)}>
                {v === 'all' ? t.filterAllMeals : PREF_LABELS[v]}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 2px' }} />
            {(['all', 'yes', 'no', 'pending'] as const).map(v => (
              <button key={v} onClick={() => setFilterAtt(v)} style={chipStyle(filterAtt === v)}>
                {v === 'all' ? t.filterAllAttending : ATT_LABELS[v]}
              </button>
            ))}
            {dupCount > 0 && (
              <>
                <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 2px' }} />
                <button onClick={() => setShowDups(s => !s)} style={chipStyle(showDups)}>
                  {t.showDuplicates} ({dupCount})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-soft)', fontSize: 13 }}>{t.noResults}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--cream-deep)', position: 'sticky', top: 0 }}>
                  {[t.colName, t.colPhone, t.colGuests, t.colMeal, t.colAttending, t.colSide, ''].map(h => (
                    <th key={h} style={{ textAlign: 'start', fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '9px 14px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)', background: r.isDuplicate ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 600, color: 'var(--ink)' }}>{r.name}</td>
                    <td style={{ padding: '9px 14px', color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{r.phone}</td>
                    <td style={{ padding: '9px 14px', textAlign: 'center' }}>{r.guests}</td>
                    <td style={{ padding: '9px 14px', color: 'var(--ink-soft)' }}>{PREF_LABELS[r.pref] ?? r.pref}</td>
                    <td style={{ padding: '9px 14px', color: r.attending === 'yes' ? '#16A34A' : r.attending === 'no' ? '#DC2626' : 'var(--ink-muted)' }}>
                      {ATT_LABELS[r.attending] ?? r.attending}
                    </td>
                    <td style={{ padding: '9px 14px', color: 'var(--ink-soft)' }}>
                      {r.side === 'groom' ? t.sideGroom : r.side === 'bride' ? t.sideBride : '—'}
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      {r.isDuplicate
                        ? <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 4 }}>{t.importDuplicate}</span>
                        : <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #86EFAC', borderRadius: 4 }}>{t.importNew}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: 'var(--surface)', borderRadius: '0 0 16px 16px' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)', flex: 1 }}>
            {t.importCount(toImport.length)}
            {dupCount > 0 && <span style={{ color: '#DC2626', marginInlineStart: 8 }}>· {dupCount} {t.importDuplicate.toLowerCase()}</span>}
          </span>
          <button onClick={onClose} style={{ height: 34, padding: '0 16px', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.cancel}</button>
          <button
            onClick={() => onConfirm(toImport)}
            disabled={toImport.length === 0}
            style={{ height: 34, padding: '0 20px', background: toImport.length === 0 ? 'var(--green-light)' : 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: toImport.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>
            {t.importCount(toImport.length)}
          </button>
        </div>
      </div>
    </>
  );
}
