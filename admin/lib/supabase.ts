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

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);
