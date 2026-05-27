'use client';
import { useState, useCallback } from 'react';
import { supabase, RsvpAudit } from '@/lib/supabase';
import { useLang } from '@/app/providers';
import { translateSummary, splitSummaryParts } from '@/lib/translateSummary';

type AuditEntry = RsvpAudit & { guestName: string };

export default function HistoryLogPanel() {
  const { t } = useLang();
  const [open, setOpen]         = useState(false);
  const [entries, setEntries]   = useState<AuditEntry[]>([]);
  const [loading, setLoading]   = useState(false);
  const [loaded, setLoaded]     = useState(false);

  const isRtl = t.dir === 'rtl';

  const fetchLog = useCallback(async () => {
    setLoading(true);
    const { data: audit } = await supabase
      .from('rsvp_audit')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(200);
    if (!audit || audit.length === 0) { setLoading(false); setLoaded(true); setEntries([]); return; }

    const ids = Array.from(new Set((audit as RsvpAudit[]).map(e => e.rsvp_id)));
    const { data: rsvps } = await supabase.from('rsvp').select('id, name').in('id', ids);
    const nameMap = new Map<number, string>((rsvps ?? []).map((r: { id: number; name: string }) => [r.id, r.name]));

    setEntries((audit as RsvpAudit[]).map(e => ({ ...e, guestName: nameMap.get(e.rsvp_id) ?? `#${e.rsvp_id}` })));
    setLoading(false);
    setLoaded(true);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    if (!loaded) fetchLog();
  };

  const sideKey = isRtl ? 'left' : 'right';
  const slideOut = isRtl ? 'translateX(-100%)' : 'translateX(100%)';

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'fixed', bottom: 24, [sideKey]: 24, zIndex: 90,
          height: 42, padding: '0 18px',
          background: 'var(--green-deep)', color: '#fff',
          border: 'none', borderRadius: 999,
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          fontFamily: 'var(--font-ui)',
          transition: 'box-shadow 0.15s',
        }}
      >
        🕐 {t.activityLog}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 101 }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0, [sideKey]: 0,
        width: '100%', maxWidth: 420,
        background: 'var(--cream)', borderInlineStart: '1px solid var(--line)',
        zIndex: 102, overflowY: 'auto',
        boxShadow: isRtl ? '12px 0 40px rgba(0,0,0,0.1)' : '-12px 0 40px rgba(0,0,0,0.1)',
        fontFamily: 'var(--font-ui)',
        transform: open ? 'translateX(0)' : slideOut,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, padding: '18px 24px 14px', borderBottom: '1px solid var(--line)', background: 'var(--surface)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>🕐 {t.activityLog}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { setLoaded(false); fetchLog(); }}
              style={{ height: 30, padding: '0 12px', background: 'var(--cream-deep)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)', fontFamily: 'var(--font-ui)' }}
            >
              ↺ {t.refresh}
            </button>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1, padding: 4 }}>×</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px 32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-soft)', fontSize: 13, letterSpacing: '0.15em' }}>{t.loading}</div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-soft)', fontSize: 13 }}>{t.activityEmpty}</div>
          ) : (
            entries.map(e => (
              <div key={e.id} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {new Date(e.changed_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--green)', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
                    {e.changed_by}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                    {e.guestName}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {splitSummaryParts(translateSummary(e.summary, t.dir)).map((p, i) =>
                    p.type === 'ltr'
                      ? <span key={i} style={{ unicodeBidi: 'isolate', direction: 'ltr', display: 'inline-block' }}>{p.value}</span>
                      : <span key={i}>{p.value}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
