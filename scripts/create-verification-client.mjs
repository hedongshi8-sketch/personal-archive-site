import { createClient } from "@supabase/supabase-js";
import "./load-local-env.mjs";

class VerificationWebSocket {
  constructor() {
    throw new Error("Verification scripts do not open realtime WebSocket connections.");
  }
}

const requestTimeoutMs = Number(process.env.VERIFICATION_FETCH_TIMEOUT_MS ?? 30000);

async function fetchWithTimeout(input, init = {}) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), requestTimeoutMs);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    return await fetch(input, {
      ...init,
      signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createVerificationClient(supabaseUrl, supabaseAnonKey) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: fetchWithTimeout,
    },
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
