import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const missingEnv = [
  !supabaseUrl ? "VITE_SUPABASE_URL" : null,
  !supabaseAnonKey ? "VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)" : null,
].filter(Boolean);

if (missingEnv.length > 0) {
  throw new Error(
    `[ProseCraft] Missing Supabase environment variable(s): ${missingEnv.join(", ")}. ` +
      `For local development, copy .env.example to .env (or .env.local) and fill in staging Supabase credentials. ` +
      `For CI, set these as GitHub Actions secrets — see docs/CI_SECRETS.md.`
  );
}

if (
  !import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
) {
  console.warn(
    "[ProseCraft] VITE_SUPABASE_PUBLISHABLE_KEY is deprecated; use VITE_SUPABASE_ANON_KEY for staging setup."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
