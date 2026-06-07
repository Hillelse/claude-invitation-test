import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Supabase Database Webhook payload (INSERT / UPDATE on public.rsvp)
type RsvpRecord = {
  id?: number;
  name?: string;
  phone?: string;
  attending?: string;
  guests?: number;
  pref?: string;
  notes?: string | null;
  status?: string | null;
  side?: 'groom' | 'bride' | null;
};

type WebhookBody = {
  type?: 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  record?: RsvpRecord;
  old_record?: RsvpRecord | null;
};

const TG_API = (token: string, method: string) =>
  `https://api.telegram.org/bot${token}/${method}`;

const sideLabel = (side?: string | null) =>
  side === 'groom' ? 'חתן' : side === 'bride' ? 'כלה' : 'לא מסומן';

const statusLabel = (rec: RsvpRecord) => {
  const s = (rec.status || '').toLowerCase();
  if (s === 'confirmed' || rec.attending === 'yes') return '✅ אישר/ה הגעה';
  if (s === 'declined' || rec.attending === 'no') return '❌ לא יגיע/ה';
  return rec.status || rec.attending || '—';
};

const prefLabel = (pref?: string) => {
  switch (pref) {
    case 'regular': return 'רגיל (חלק)';
    case 'vegan': return 'טבעוני';
    case 'kosher': return 'חלק מחפוד';
    default: return pref || '—';
  }
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildMessage(body: WebhookBody): string {
  const r = body.record || {};
  const isUpdate = body.type === 'UPDATE';
  const title = isUpdate ? '✏️ <b>עדכון אישור הגעה</b>' : '🎉 <b>אישור הגעה חדש</b>';
  const lines = [
    title,
    '',
    `👤 <b>${esc(r.name || '—')}</b>`,
    `🎀 צד: ${esc(sideLabel(r.side))}`,
    `📋 סטטוס: ${esc(statusLabel(r))}`,
    `👥 אורחים: ${esc(r.guests ?? '—')}`,
    `🍽️ תפריט: ${esc(prefLabel(r.pref))}`,
    `📞 טלפון: ${esc(r.phone || '—')}`,
  ];
  if (r.notes && String(r.notes).trim()) lines.push(`📝 הערה: ${esc(r.notes)}`);
  return lines.join('\n');
}

// UPDATE filter: only notify when a guest-facing field actually changed
// (so admin-only edits — side, lang, internal_notes — stay silent).
function guestFieldsChanged(rec: RsvpRecord, old?: RsvpRecord | null): boolean {
  if (!old) return true;
  const keys: (keyof RsvpRecord)[] = ['attending', 'guests', 'pref', 'status'];
  return keys.some(k => rec[k] !== old[k]);
}

function recipients(side: string | null | undefined): string[] {
  const groom = process.env.TELEGRAM_GROOM_CHAT_ID;
  const bride = process.env.TELEGRAM_BRIDE_CHAT_ID;
  let ids: (string | undefined)[];
  if (side === 'groom') ids = [groom];
  else if (side === 'bride') ids = [bride];
  else ids = [groom, bride]; // untagged → both
  return Array.from(new Set(ids.filter((x): x is string => !!x)));
}

async function sendTelegram(token: string, chatId: string, text: string) {
  const res = await fetch(TG_API(token, 'sendMessage'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const json = await res.json().catch(() => ({}));
  return { chatId, ok: res.ok && (json as { ok?: boolean }).ok !== false, status: res.status, detail: json };
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'rsvp-notify' });
}

export async function POST(req: NextRequest) {
  // Auth: shared secret header set on the Supabase webhook.
  const expected = process.env.RSVP_WEBHOOK_SECRET;
  const got = req.headers.get('x-webhook-secret');
  if (!expected || got !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  if (body.table && body.table !== 'rsvp') {
    return NextResponse.json({ ok: true, skipped: 'other table' });
  }
  if (body.type !== 'INSERT' && body.type !== 'UPDATE') {
    return NextResponse.json({ ok: true, skipped: `type ${body.type}` });
  }
  if (body.type === 'UPDATE' && !guestFieldsChanged(body.record || {}, body.old_record)) {
    return NextResponse.json({ ok: true, skipped: 'no guest-facing change' });
  }

  const targets = recipients(body.record?.side);
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, skipped: 'no recipients configured' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    // Don't 500 — keep the webhook from retry-storming. Report config gap.
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing', targets });
  }

  const text = buildMessage(body);
  const results = await Promise.all(targets.map(id => sendTelegram(token, id, text)));
  const sent = results.filter(r => r.ok).map(r => r.chatId);
  const failed = results.filter(r => !r.ok);
  if (failed.length) console.error('rsvp-notify: telegram send failed', failed);

  // Always 200 so Supabase doesn't retry on partial failure.
  return NextResponse.json({ ok: true, sent, failed: failed.map(f => ({ chatId: f.chatId, status: f.status })) });
}
