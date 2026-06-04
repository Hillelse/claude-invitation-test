import { normalizePhone } from './validation';
import type { Rsvp } from './supabase';

export type MsgLang = 'he' | 'fr' | 'both';

export const INVITATION_URL = 'https://shirel-hillel-project.vercel.app/';

export type Templates = { he: string; fr: string };

export const DEFAULT_TEMPLATES: Templates = {
  he: `שלום {name}! 🌿\nאנחנו מתחתנים ב-9.8.2026 ונשמח לראותכם.\nכל הפרטים ואישור הגעה כאן:\n${INVITATION_URL}`,
  fr: `Bonjour {name} ! 🌿\nNous nous marions le 9/08/2026 et serions ravis de vous compter parmi nous.\nTous les détails et confirmation ici :\n${INVITATION_URL}`,
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
