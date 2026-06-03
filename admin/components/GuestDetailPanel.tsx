'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase, Rsvp, RsvpAudit } from '@/lib/supabase';
import StatusBadge from './StatusBadge';
import { useLang } from '@/app/providers';
import { isValidPhone, normalizePhone } from '@/lib/validation';
import { translateSummary, splitSummaryParts } from '@/lib/translateSummary';

type Props = {
  guest: Rsvp;
  onClose: () => void;
  onUpdate: (updated: Rsvp) => void;
  onDelete: (id: number) => void;
  toast: (text: string, type?: 'success' | 'error') => void;
  isDuplicate?: boolean;
};

export default function GuestDetailPanel({ guest, onClose, onUpdate, onDelete, toast, isDuplicate }: Props) {
  const { t } = useLang();
  const { data: session } = useSession();
  const [editing, setEditing]         = useState(false);
  const [form, setForm]               = useState({ ...guest });
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirm]   = useState(false);
  const [history, setHistory]         = useState<RsvpAudit[]>([]);

  useEffect(() => {
    setForm({ ...guest });
    supabase.from('rsvp_audit').select('*').eq('rsvp_id', guest.id).order('changed_at', { ascending: false })
      .then(({ data }) => setHistory((data ?? []) as RsvpAudit[]));
  }, [guest.id]);

  const PREF_LABELS: Record<string, string> = { regular: t.mealRegular, vegan: t.mealVegan, kosher: t.mealKosher };

  const waHref = (() => {
    if (!guest.phone) return null;
    const local = normalizePhone(guest.phone); // strips country prefix → local 0xxx format
    const digits = local.replace(/\D/g, '');
    let intl: string;
    if (digits.startsWith('06') || digits.startsWith('07')) {
      intl = '33' + digits.slice(1);        // French mobile
    } else if (digits.startsWith('0')) {
      intl = '972' + digits.slice(1);       // Israeli (05x, 02-09)
    } else {
      intl = digits;                        // already international (no leading 0)
    }
    const msg = encodeURIComponent(t.whatsAppMessage(guest.name));
    return `https://wa.me/${intl}?text=${msg}`;
  })();

  const ts = (s: string) => translateSummary(s, t.dir);

  const upd = (k: keyof Rsvp) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!isValidPhone(form.phone)) { toast(t.invalidPhone, 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('rsvp').update({
      name: form.name, phone: form.phone, attending: form.attending,
      guests: Number(form.guests), pref: form.pref, notes: form.notes || null,
      status: form.status, internal_notes: form.internal_notes || null,
      side: form.side,
    }).eq('id', guest.id);
    if (error) { setSaving(false); toast(error.message, 'error'); return; }
    const diff: string[] = [];
    // wrap numeric changes in LTR embedding to prevent bidi reversal in RTL UI
    const ltr = (a: unknown, b: unknown) => '‪' + a + '→' + b + '‬';
    if (form.name !== guest.name)               diff.push(`שם: ${guest.name}→${form.name}`);
    if (form.attending !== guest.attending)      diff.push(`הגעה: ${guest.attending}→${form.attending}`);
    if (Number(form.guests) !== guest.guests)   diff.push(`אורחים: ${ltr(guest.guests, form.guests)}`);
    if (form.status !== guest.status)           diff.push(`סטטוס: ${guest.status}→${form.status}`);
    if (form.pref !== guest.pref)               diff.push(`תפריט: ${guest.pref}→${form.pref}`);
    if (form.phone !== guest.phone)             diff.push(`טלפון: ${ltr(guest.phone, form.phone)}`);
    if (form.side !== guest.side)               diff.push(`צד: ${guest.side ?? '—'}→${form.side ?? '—'}`);
    if (diff.length > 0) {
      const entry = { rsvp_id: guest.id, changed_by: session?.user?.name ?? 'admin', summary: diff.join(' · ') };
      const { error: auditErr } = await supabase.from('rsvp_audit').insert(entry);
      if (auditErr) { toast(`Audit: ${auditErr.message}`, 'error'); }
    }
    // Re-fetch history to show latest
    const { data: freshHistory } = await supabase.from('rsvp_audit').select('*').eq('rsvp_id', guest.id).order('changed_at', { ascending: false });
    if (freshHistory) setHistory(freshHistory as RsvpAudit[]);
    setSaving(false);
    onUpdate({ ...form, guests: Number(form.guests) });
    setEditing(false);
    toast(t.guestUpdated);
  };

  const del = async () => {
    const { error } = await supabase.from('rsvp').delete().eq('id', guest.id);
    if (error) { toast(error.message, 'error'); return; }
    onDelete(guest.id);
    onClose();
    toast(t.guestDeleted);
  };

  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const inp: React.CSSProperties = { width: '100%', height: 36, padding: '0 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-ui)' };
  const ta:  React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-ui)', lineHeight: 1.5 };

  const Field = ({ label, val, mono = false }: { label: string; val: string; mono?: boolean }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: val ? 'var(--ink)' : 'var(--ink-muted)', fontStyle: val ? 'normal' : 'italic', fontVariantNumeric: mono ? 'tabular-nums' : 'normal' }}>
        {val || '—'}
      </div>
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 400,
        background: 'var(--cream)', borderLeft: '1px solid var(--line)',
        zIndex: 101, overflowY: 'auto',
        boxShadow: '-12px 0 40px rgba(0,0,0,0.1)',
        fontFamily: 'var(--font-ui)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{guest.name}</div>
              <StatusBadge status={guest.status} attending={guest.attending} />
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1, padding: 4 }}>×</button>
          </div>
        </div>

        <div style={{ padding: '20px 24px 8px' }}>
          {!editing ? (
            <>
              {isDuplicate && (
                <div style={{ marginBottom: 14, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626', fontWeight: 500 }}>
                  {t.duplicatePhoneWarning}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <Field label={t.fieldPhone} val={guest.phone} mono />
                <Field label={t.fieldAttending} val={guest.attending === 'yes' ? t.filterYes : guest.attending === 'no' ? t.filterNo : '—'} />
                <Field label={t.fieldGuests} val={String(guest.guests)} mono />
                <Field label={t.fieldMeal} val={PREF_LABELS[guest.pref] ?? guest.pref} />
                <Field label={t.fieldStatus} val={guest.status ?? '—'} />
                <Field label={t.fieldSide} val={guest.side === 'groom' ? t.sideGroom : guest.side === 'bride' ? t.sideBride : '—'} />
                <Field label={t.fieldSubmitted} val={new Date(guest.created_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })} mono />
              </div>
              {guest.notes && (
                <div style={{ marginTop: 4, marginBottom: 16, padding: '12px', background: 'var(--cream-deep)', borderRadius: 8, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t.fieldMessage}</div>
                  {guest.notes}
                </div>
              )}
              <div style={{ marginBottom: 16, padding: '12px', background: 'var(--cream-deep)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t.fieldInternalNotes}</div>
                <div style={{ fontSize: 13, color: guest.internal_notes ? 'var(--ink-soft)' : 'var(--ink-muted)', fontStyle: guest.internal_notes ? 'normal' : 'italic', lineHeight: 1.5 }}>
                  {guest.internal_notes || t.none}
                </div>
              </div>

              {waHref && (
                <a href={waHref} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, marginTop: 8, background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-ui)', textDecoration: 'none' }}>
                  {t.whatsAppBtn}
                </a>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => setEditing(true)} style={{ flex: 1, height: 36, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.edit}</button>
                <button onClick={() => setConfirm(true)} style={{ flex: 1, height: 36, background: 'transparent', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.delete}</button>
              </div>

              {confirmDelete && (
                <div style={{ marginTop: 16, padding: '14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#991B1B', marginBottom: 12, fontWeight: 500 }}>{t.confirmDelete(guest.name)}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={del} style={{ flex: 1, height: 34, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.yesDelete}</button>
                    <button onClick={() => setConfirm(false)} style={{ flex: 1, height: 34, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.cancel}</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={lbl}>{t.fieldName}</label><input value={form.name} onChange={upd('name')} style={inp} /></div>
              <div><label style={lbl}>{t.fieldPhone}</label><input type="tel" value={form.phone} onChange={upd('phone')} style={inp} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>{t.fieldAttending}</label>
                  <select value={form.attending} onChange={upd('attending')} style={inp}>
                    <option value="yes">{t.filterYes}</option>
                    <option value="no">{t.filterNo}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t.fieldStatus}</label>
                  <select value={form.status ?? ''} onChange={upd('status')} style={inp}>
                    <option value="Pending">{t.filterPending}</option>
                    <option value="Confirmed">{t.filterConfirmed}</option>
                    <option value="Declined">{t.filterDeclined}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>{t.fieldGuests}</label>
                  <input type="number" min={1} max={10} value={String(form.guests)} onChange={upd('guests')} style={inp} />
                </div>
                <div>
                  <label style={lbl}>{t.fieldMeal}</label>
                  <select value={form.pref} onChange={upd('pref')} style={inp}>
                    <option value="regular">{t.mealRegular}</option>
                    <option value="vegan">{t.mealVegan}</option>
                    <option value="kosher">{t.mealKosher}</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>{t.fieldSide}</label>
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  {(['groom', null, 'bride'] as const).map(v => (
                    <button key={String(v)} type="button"
                      onClick={() => setForm(f => ({ ...f, side: v }))}
                      style={{
                        flex: 1, height: 36, border: 'none', fontSize: 13, cursor: 'pointer',
                        background: form.side === v ? (v === 'groom' ? '#DBEAFE' : v === 'bride' ? '#FCE7F3' : 'var(--cream-deep)') : 'var(--surface)',
                        color: form.side === v ? (v === 'groom' ? '#1D4ED8' : v === 'bride' ? '#BE185D' : 'var(--ink)') : 'var(--ink-soft)',
                        fontWeight: form.side === v ? 600 : 400, fontFamily: 'var(--font-ui)',
                        borderRight: v === null ? '1px solid var(--line)' : v === 'groom' ? '1px solid var(--line)' : 'none',
                      }}>
                      {v === 'groom' ? t.sideGroom : v === 'bride' ? t.sideBride : '—'}
                    </button>
                  ))}
                </div>
              </div>
              <div><label style={lbl}>{t.fieldMessage}</label><textarea value={form.notes ?? ''} onChange={upd('notes')} rows={2} style={ta} /></div>
              <div><label style={lbl}>{t.fieldInternalNotes}</label><textarea value={form.internal_notes ?? ''} onChange={upd('internal_notes')} rows={3} style={ta} /></div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button onClick={save} disabled={saving} style={{ flex: 1, height: 36, background: saving ? 'var(--green-light)' : 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>
                  {saving ? t.saving : t.save}
                </button>
                <button onClick={() => { setEditing(false); setForm({ ...guest }); }} style={{ flex: 1, height: 36, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.cancel}</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{t.historyLabel}</div>
          {history.map(h => (
            <div key={h.id} style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6, display: 'flex', gap: 6, flexWrap: 'wrap', lineHeight: 1.4 }}>
              <span style={{ color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {new Date(h.changed_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--green-deep)' }}>{h.changed_by}</span>
              <span>{splitSummaryParts(ts(h.summary)).map((p, i) =>
                p.type === 'ltr'
                  ? <span key={i} style={{ unicodeBidi: 'isolate', direction: 'ltr', display: 'inline-block' }}>{p.value}</span>
                  : <span key={i}>{p.value}</span>
              )}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6, display: 'flex', gap: 6, flexWrap: 'wrap', lineHeight: 1.4, opacity: 0.6 }}>
            <span style={{ color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {new Date(guest.created_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            <span>{t.auditCreated}</span>
          </div>
        </div>
      </div>
    </>
  );
}
