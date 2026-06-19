import { createClient } from "@supabase/supabase-js";
import "./load-local-env.mjs";

class VerificationWebSocket {
  constructor() {
    throw new Error("Verification scripts do not open realtime WebSocket connections.");
  }
}

export function createVerificationClient(supabaseUrl, supabaseAnonKey) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    realtime: {
      transport: VerificationWebSocket,
    },
  });
}
