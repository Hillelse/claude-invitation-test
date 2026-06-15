import { normalizePhone } from './validation';
import type { Rsvp } from './supabase';

export type MsgLang = 'he' | 'fr' | 'both';

export const INVITATION_URL = 'https://shirel-hillel-project.vercel.app/';

export type Templates = { he: string; fr: string };

// Emojis written via fromCodePoint so the source stays pure-ASCII (immune to any
// file-encoding issue). 🤍 = U+1F90D white heart, ✨ = U+2728 sparkles. These
// transmit correctly through the wa.me link; a ◆ in WhatsApp Web/Desktop's
// compose box on Windows is that client's render bug — recipients see real emojis.
const HEART    = String.fromCodePoint(0x1F90D); // 🤍 WHITE HEART
const SPARKLES = String.fromCodePoint(0x2728);  // ✨ SPARKLES
// NOTE: emojis render correctly only when the broadcast is sent from a PHONE.
// WhatsApp Desktop on Windows corrupts wa.me-prefilled emoji into ◆ on send —
// a client bug, not fixable here. See the in-modal tip + project memory.

// {name} is filled per-guest by buildMessage().
export const DEFAULT_TEMPLATES: Templates = {
  he: `{name} !\nבשעה טובה אנו מזמינים אתכם לחגוג את חתונתנו ${HEART}\nאת כל פרטי היום הגדול ואישורי הגעה תוכלו למצוא בקישור למטה:\n${INVITATION_URL}\nנשמח לחלוק אתכם את הרגע היקר הזה ${SPARKLES}\nנשמח לראותכם!\nשיראל והלל ${HEART}`,
  fr: `{name} !\nC'est avec une immense joie et une grande reconnaissance envers Hachem que nous vous invitons à célébrer notre mariage ${HEART}\nVous trouverez tous les details du jour J sur le lien ci-dessous :\n${INVITATION_URL}\nNous serons heureux de partager ce précieux moment avec vous ${SPARKLES}\nHâte de vous retrouver pour faire la fête !\nShirel & Hillel ${HEART}`,
};

/** Raw phone → international digits (no +). FR mobile 06/07 → 33…, other 0… → 972…, else as-is. */
export function phoneToIntl(phone: string): string {
  const local = normalizePhone(phone);
  const digits = local.replace(/\D/g, '');
  if (digits.startsWith('06') || digits.startsWith('07')) return '33' + digits.slice(1);
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return digits;
}

/** Guess language from phone country: 33 → fr, 972 → he, unknown → both. */
export function inferLang(phone: string): MsgLang {
  const intl = phoneToIntl(phone);
  if (intl.startsWith('33')) return 'fr';
  if (intl.startsWith('972')) return 'he';
  return 'both';
}

/** Explicit tag wins; otherwise infer from phone. */
export function resolveLang(guest: Pick<Rsvp, 'lang' | 'phone'>): MsgLang {
  return guest.lang ?? inferLang(guest.phone);
}

/** Build the message body for a guest, filling {name}. 'both' = Hebrew + divider + French. */
export function buildMessage(guest: Pick<Rsvp, 'name' | 'lang' | 'phone'>, templates: Templates): string {
  const fill = (tpl: string) => tpl.replace(/\{name\}/g, guest.name);
  const lang = resolveLang(guest);
  if (lang === 'he') return fill(templates.he);
  if (lang === 'fr') return fill(templates.fr);
  return `${fill(templates.he)}\n———\n${fill(templates.fr)}`;
}

export function waLink(intl: string, text: string): string {
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

/** Full wa.me link for a guest using the given templates. null if no phone. */
export function guestWaLink(guest: Pick<Rsvp, 'name' | 'lang' | 'phone'>, templates: Templates): string | null {
  if (!guest.phone) return null;
  return waLink(phoneToIntl(guest.phone), buildMessage(guest, templates));
}
