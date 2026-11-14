export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function getSupabaseEnvConfig(): SupabaseEnvConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is required when Supabase is configured.'
    );
  }

  return { url, anonKey, serviceRoleKey };
}

export function getServerSigningSecret(): string {
  const configured =
    process.env.MOCK_PAYMENT_WEBHOOK_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing server signing secret (MOCK_PAYMENT_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY) in production.'
    );
  }

  return 'dsa-local-dev-signing-secret-do-not-use-in-prod';
}

export function getWebhookSigningSecret(): string {
  const configured = process.env.MOCK_PAYMENT_WEBHOOK_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing MOCK_PAYMENT_WEBHOOK_SECRET in production.'
    );
  }

  return 'dsa-local-dev-webhook-secret';
}
