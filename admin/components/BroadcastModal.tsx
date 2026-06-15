'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { supabase, Rsvp } from '@/lib/supabase';
import { useLang } from '@/app/providers';
import { DEFAULT_TEMPLATES, buildMessage, resolveLang, guestWaLink, type Templates } from '@/lib/whatsapp';

type Props = {
  recipients: Rsvp[];
  onClose: () => void;
  onMessaged: (id: number, messagedAt: string) => void;
  onLangChange: (id: number, lang: 'he' | 'fr' | 'both') => void;
  toast: (text: string, type?: 'success' | 'error') => void;
};

const LS_HE  = 'broadcastTplHe';
const LS_FR  = 'broadcastTplFr';
const LS_VER = 'broadcastTplVersion';
const TPL_VERSION = '7'; // bump when DEFAULT_TEMPLATES changes to flush stale localStorage

const loadTpl = (): Templates => {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  if (localStorage.getItem(LS_VER) !== TPL_VERSION) {
    localStorage.removeItem(LS_HE);
    localStorage.removeItem(LS_FR);
    localStorage.setItem(LS_VER, TPL_VERSION);
    return DEFAULT_TEMPLATES;
  }
  return {
    he: localStorage.getItem(LS_HE) ?? DEFAULT_TEMPLATES.he,
    fr: localStorage.getItem(LS_FR) ?? DEFAULT_TEMPLATES.fr,
  };
};

export default function BroadcastModal({ recipients, onClose, onMessaged, onLangChange, toast }: Props) {
  const { t } = useLang();
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Templates>(loadTpl);
  const [skipMessaged, setSkipMessaged] = useState(true);
  const [idx, setIdx] = useState(0);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [overrides, setOverrides] = useState<Record<number, 'he' | 'fr' | 'both'>>({});

  // Apply any in-session language override to a guest before building the message.
  const withLang = (g: Rsvp): Rsvp => (overrides[g.id] ? { ...g, lang: overrides[g.id] } : g);

  // Queue fixed at open time, recomputed only when skipMessaged toggles.
  const queue = useMemo(
    () => recipients.filter(r => r.phone && (!skipMessaged || !r.messaged_at)),
    [recipients, skipMessaged]
  );

  const langLabel = (l: 'he' | 'fr' | 'both') => (l === 'he' ? t.langHe : l === 'fr' ? t.langFr : t.langBoth);

  const setTpl = (k: keyof Templates) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTemplates(prev => {
      const next = { ...prev, [k]: val };
      if (typeof window !== 'undefined') localStorage.setItem(k === 'he' ? LS_HE : LS_FR, val);
      return next;
    });
  };

  const resetTpl = () => {
    setTemplates(DEFAULT_TEMPLATES);
    if (typeof window !== 'undefined') { localStorage.removeItem(LS_HE); localStorage.removeItem(LS_FR); }
  };

  const current = queue[idx];

  const setLang = async (lang: 'he' | 'fr' | 'both') => {
    if (!current) return;
    setOverrides(o => ({ ...o, [current.id]: lang }));
    const { error } = await supabase.from('rsvp').update({ lang }).eq('id', current.id);
    if (error) { toast(error.message, 'error'); return; }
    onLangChange(current.id, lang);
  };

  const openAndNext = async () => {
    if (!current) return;
    const link = guestWaLink(withLang(current), templates);
    if (link) window.open(link, '_blank');
    const ts = new Date().toISOString();
    const { error } = await supabase.from('rsvp').update({ messaged_at: ts }).eq('id', current.id);
    if (error) { toast(error.message, 'error'); return; }
    await supabase.from('rsvp_audit').insert({
      rsvp_id: current.id, changed_by: session?.user?.name ?? 'admin', summary: 'נשלחה הזמנה',
    });
    setSent(s => new Set(s).add(current.id));
    onMessaged(current.id, ts);
    setIdx(i => i + 1);
  };

  const skip = () => { if (current) setSkipped(s => new Set(s).add(current.id)); setIdx(i => i + 1); };
  const back = () => setIdx(i => Math.max(0, i - 1));

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-ui)', lineHeight: 1.5 };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };

  const done = idx >= queue.length;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'calc(100% - 32px)', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
        background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 14, zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: 'var(--font-ui)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', position: 'sticky', top: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>{t.broadcastTitle}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Anti-spam note */}
          <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>
            ⚠ {t.broadcastNote}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' }}>
              <input type="checkbox" checked={skipMessaged} onChange={e => { setSkipMessaged(e.target.checked); setIdx(0); }} style={{ width: 14, height: 14, accentColor: 'var(--green)' }} />
              {t.broadcastSkipMessaged}
            </label>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-deep)' }}>{t.broadcastProgress(sent.size, queue.length)}</span>
          </div>

          {/* Templates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{t.broadcastNameHint}</span>
              <button onClick={resetTpl} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: 'var(--ink-soft)', fontFamily: 'var(--font-ui)' }}>{t.broadcastReset}</button>
            </div>
            <div><label style={lbl}>{t.broadcastTemplateHe}</label><textarea dir="rtl" value={templates.he} onChange={setTpl('he')} rows={4} style={inp} /></div>
            <div><label style={lbl}>{t.broadcastTemplateFr}</label><textarea dir="ltr" value={templates.fr} onChange={setTpl('fr')} rows={4} style={inp} /></div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)' }} />

          {/* Send queue */}
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-soft)', fontSize: 14 }}>{t.broadcastNoRecipients}</div>
          ) : done ? (
            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 16, fontWeight: 600, color: 'var(--green-deep)' }}>{t.broadcastAllSent}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{current.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)', direction: 'ltr' }}>{current.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{t.fieldLang}:</span>
                  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    {(['he', 'fr', 'both'] as const).map((v, i) => {
                      const active = resolveLang(withLang(current)) === v;
                      return (
                        <button key={v} type="button" onClick={() => setLang(v)}
                          style={{ height: 28, padding: '0 12px', border: 'none', fontSize: 12, cursor: 'pointer',
                            background: active ? 'var(--green)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink-soft)',
                            fontWeight: active ? 600 : 400, fontFamily: 'var(--font-ui)', borderRight: i < 2 ? '1px solid var(--line)' : 'none' }}>
                          {langLabel(v)}
                        </button>
                      );
                    })}
                  </div>
                  {current.messaged_at && <span style={{ fontSize: 11, color: '#16A34A' }}>{t.broadcastSent}</span>}
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, padding: '10px 12px', background: 'var(--cream-deep)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink)', fontFamily: 'var(--font-ui)', lineHeight: 1.6, maxHeight: 180, overflowY: 'auto' }}>
                  {buildMessage(withLang(current), templates)}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={back} disabled={idx === 0} style={{ height: 40, padding: '0 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1, fontFamily: 'var(--font-ui)' }}>{t.broadcastBack}</button>
                <button onClick={skip} style={{ height: 40, padding: '0 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.broadcastSkip}</button>
                <button onClick={openAndNext} style={{ flex: 1, height: 40, background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.broadcastOpenNext}</button>
              </div>

              {/* Queue list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 160, overflowY: 'auto', marginTop: 4 }}>
                {queue.map((r, i) => {
                  const st = sent.has(r.id) ? 'sent' : skipped.has(r.id) ? 'skipped' : i === idx ? 'current' : 'pending';
                  return (
                    <div key={r.id} onClick={() => setIdx(i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                      background: st === 'current' ? 'rgba(79,107,82,0.1)' : 'transparent', color: 'var(--ink)' }}>
                      <span style={{ fontWeight: st === 'current' ? 600 : 400 }}>{i + 1}. {r.name}</span>
                      <span style={{ fontSize: 11, color: st === 'sent' ? '#16A34A' : st === 'skipped' ? 'var(--ink-muted)' : 'var(--ink-soft)' }}>
                        {st === 'sent' ? t.broadcastSent : st === 'skipped' ? t.broadcastSkippedTag : t.broadcastPendingTag}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={onClose} style={{ height: 38, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.broadcastClose}</button>
        </div>
      </div>
    </>
  );
}
