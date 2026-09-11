import { createClient } from '@supabase/supabase-js';

// 2026-09-11: the Vercel project stores these as NEXT_PUBLIC_* (it was labelled Next.js),
// and Vite only exposed VITE_* - so production threw on every load. vite.config.ts now
// also exposes NEXT_PUBLIC_*, which are public by design; no secret is reachable.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
