import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

import { getServerSigningSecret } from '@/lib/db/env';

export const AUTH_COOKIE_NAME = 'dsa_auth_session';
export const CART_COOKIE_NAME = 'dsa_cart';
export const EXPERIMENT_COOKIE_NAME = 'dsa_experiment';
export const GUEST_ORDERS_COOKIE_NAME = 'dsa_guest_orders';

export interface AuthSessionCookiePayload {
  user_id: string;
  exp: number;
}

export interface CartCookiePayload {
  items: Array<{ product_id: string; quantity: number }>;
  updated_at: string;
}

export interface ExperimentCookiePayload {
  assignment_id: string;
  visitor_id: string;
  participant_code: string;
}

export interface GuestOrdersCookiePayload {
  order_ids: string[];
}

function hmacSign(encoded: string, secret: string): string {
  return createHmac('sha256', secret).update(encoded).digest('base64url');
}

export function signCookiePayload<T>(payload: T): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const sig = hmacSign(encoded, getServerSigningSecret());
  return `${encoded}.${sig}`;
}

export function verifyCookiePayload<T>(rawValue: string | undefined): T | null {
  if (!rawValue) return null;
  const dotIdx = rawValue.indexOf('.');
  if (dotIdx <= 0) return null;

  const encoded = rawValue.slice(0, dotIdx);
  const providedSig = rawValue.slice(dotIdx + 1);
  if (!encoded || !providedSig) return null;

  const expectedSig = hmacSign(encoded, getServerSigningSecret());
  const a = Buffer.from(providedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getDefaultCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export async function readSignedCookie<T>(name: string): Promise<T | null> {
  const store = await cookies();
  return verifyCookiePayload<T>(store.get(name)?.value);
}

export async function writeSignedCookie<T>(
  name: string,
  payload: T,
  maxAgeSeconds = 60 * 60 * 24 * 7
): Promise<void> {
  const store = await cookies();
  store.set(
    name,
    signCookiePayload(payload),
    getDefaultCookieOptions(maxAgeSeconds)
  );
}

export async function clearCookie(name: string): Promise<void> {
  const store = await cookies();
  store.set(name, '', getDefaultCookieOptions(0));
}
