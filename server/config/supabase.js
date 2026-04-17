import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

export const supabase = env.hasSupabase
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
