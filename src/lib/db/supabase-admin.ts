import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseEnvConfig } from './env';

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  const config = getSupabaseEnvConfig();
  if (!config) {
    return null;
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedAdminClient;
}
