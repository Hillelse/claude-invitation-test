'use client';
import { useState } from 'react';
import { supabase, Rsvp } from '@/lib/supabase';
import { useLang } from '@/app/providers';
import { isValidPhone } from '@/lib/validation';

type Props = {
  onClose: () => void;
  onAdded: (r: Rsvp) => void;
  toast: (text: string, type?: 'success' | 'error') => void;
};

const EMPTY = { name: '', phone: '', attending: 'pending', guests: 1, pref: 'regular', status: 'Pending', notes: '', internal_notes: '' };

export default function AddGuestModal({ onClose, onAdded, toast }: Props) {
  const { t } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const upd = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm(f => {
      const next = { ...f, [k]: val };
      if (k === 'attending') next.status = val === 'yes' ? 'Confirmed' : val === 'no' ? 'Declined' : 'Pending';
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { toast(t.nameRequired, 'error'); return; }
    if (!isValidPhone(form.phone)) { toast(t.invalidPhone, 'error'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('rsvp').insert([{
      name: form.name, phone: form.phone, attending: form.attending,
      guests: Number(form.guests), pref: form.pref, status: form.status,
      notes: form.notes || null, internal_notes: form.internal_notes || null,
    }]).select().single();
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    onAdded(data as Rsvp);
    onClose();
    toast(t.guestAdded);
  };

  const inp: React.CSSProperties = { width: '100%', height: 36, padding: '0 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-ui)' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const ta:  React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-ui)', lineHeight: 1.5 };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'calc(100% - 32px)', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--cream)', border: '1px solid var(--line)',
        borderRadius: 14, zIndex: 201, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        fontFamily: 'var(--font-ui)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>{t.addGuestTitle}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={submit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={lbl}>{t.fieldName} *</label><input required value={form.name} onChange={upd('name')} style={inp} /></div>
          <div><label style={lbl}>{t.fieldPhone} *</label><input required type="tel" value={form.phone} onChange={upd('phone')} style={inp} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>{t.fieldAttending}</label>
              <select value={form.attending} onChange={upd('attending')} style={inp}>
                <option value="pending">{t.filterPending}</option>
                <option value="yes">{t.filterYes}</option>
                <option value="no">{t.filterNo}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t.fieldGuests}</label>
              <input type="number" min={1} max={10} value={form.guests} onChange={upd('guests')} style={inp} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>{t.fieldMeal}</label>
              <select value={form.pref} onChange={upd('pref')} style={inp}>
                <option value="regular">{t.mealRegular}</option>
                <option value="vegan">{t.mealVegan}</option>
                <option value="kosher">{t.mealKosher}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t.fieldStatus}</label>
              <select value={form.status} onChange={upd('status')} style={inp}>
                <option value="Confirmed">{t.filterConfirmed}</option>
                <option value="Pending">{t.filterPending}</option>
                <option value="Declined">{t.filterDeclined}</option>
              </select>
            </div>
          </div>
          <div><label style={lbl}>{t.fieldMessage}</label><textarea value={form.notes} onChange={upd('notes')} rows={2} style={ta} /></div>
          <div><label style={lbl}>{t.fieldInternalNotes}</label><textarea value={form.internal_notes} onChange={upd('internal_notes')} rows={2} style={ta} /></div>

          <div style={{ paddingTop: 4, display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, height: 38, background: saving ? 'var(--green-light)' : 'var(--green-deep)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>
              {saving ? t.adding : t.addGuestTitle}
            </button>
            <button type="button" onClick={onClose} style={{ height: 38, padding: '0 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{t.cancel}</button>
          </div>
        </form>
      </div>
    </>
  );
}
