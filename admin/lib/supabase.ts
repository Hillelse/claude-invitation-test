import { createClient } from '@supabase/supabase-js';

export type Rsvp = {
  id: number;
  name: string;
  phone: string;
  attending: string;
  guests: number;
  pref: string;
  notes: string | null;
  status: string | null;
  internal_notes: string | null;
  side: 'groom' | 'bride' | null;
  lang: 'he' | 'fr' | 'both' | null;
  messaged_at: string | null;
  created_at: string;
};

export type RsvpAudit = {
  id: number;
  rsvp_id: number;
  changed_by: string;
  changed_at: string;
  summary: string;
};

const realClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

/**
 * DEV SAFETY: when the admin runs on localhost we never want test edits to touch
 * the live database. Reads still go to live (so you see real guests), but every
 * write (insert/update/upsert/delete) is intercepted and resolved as a fake
 * success. The UI already updates its own React state optimistically, so all
 * features keep working in-session — nothing is persisted to the live DB.
 */
const READONLY =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const WRITE_OPS = new Set(['insert', 'update', 'upsert', 'delete']);

/* eslint-disable @typescript-eslint/no-explicit-any */
// A chainable thenable that mimics a successful Supabase write. `.select()`,
// `.eq()`, `.in()`, `.order()` etc. all return itself; awaiting it resolves
// { data, error: null }. `.single()`/`.maybeSingle()` collapse data to one row.
function fakeWrite(payload: any) {
  const rows = (Array.isArray(payload) ? payload : [payload]).map((row: any) =>
    row && typeof row === 'object'
      ? { id: Math.floor(Math.random() * 1e9), created_at: new Date().toISOString(), ...row }
      : row
  );
  let single = false;
  const proxy: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'single' || prop === 'maybeSingle') return () => { single = true; return proxy; };
        if (prop === 'then') {
          const data = single ? rows[0] ?? null : rows;
          return (resolve: (v: any) => void) => resolve({ data, error: null });
        }
        if (prop === 'catch' || prop === 'finally') return () => proxy;
        return () => proxy; // select / eq / in / order / limit / match / …
      },
    }
  );
  return proxy;
}

function wrapReadonly(client: typeof realClient): typeof realClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (table: string) => {
          const qb: any = (target as any).from(table);
          return new Proxy(qb, {
            get(qt, qprop) {
              if (typeof qprop === 'string' && WRITE_OPS.has(qprop)) {
                return (payload: any) => fakeWrite(payload);
              }
              const val = qt[qprop];
              return typeof val === 'function' ? val.bind(qt) : val;
            },
          });
        };
      }
      const val = Reflect.get(target, prop, receiver);
      return typeof val === 'function' ? val.bind(target) : val;
    },
  }) as typeof realClient;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

if (READONLY) {
  // eslint-disable-next-line no-console
  console.warn('[DEV] localhost detected — Supabase writes are DISABLED (live DB protected).');
}

export const DB_READONLY = READONLY;
export const supabase = READONLY ? wrapReadonly(realClient) : realClient;
