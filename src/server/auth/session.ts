import { isSupabaseConfigured } from '@/lib/db/env';
import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import { forbiddenError, unauthorizedError } from '@/server/errors';
import { getStore, type UserRecord } from '@/server/store';
import type { UserProfileDto } from '@/types/api';

import {
  AUTH_COOKIE_NAME,
  EXPERIMENT_COOKIE_NAME,
  GUEST_ORDERS_COOKIE_NAME,
  type AuthSessionCookiePayload,
  type ExperimentCookiePayload,
  type GuestOrdersCookiePayload,
  readSignedCookie,
} from './cookies';

export function toUserProfileDto(user: UserRecord): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    shop_category: user.shop_category,
    created_at: user.created_at,
  };
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const store = getStore();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const profile = await store.findUserById(user.id);
    return profile;
  }

  const session = await readSignedCookie<AuthSessionCookiePayload>(
    AUTH_COOKIE_NAME
  );
  if (!session || !session.user_id || session.exp <= Date.now()) {
    return null;
  }

  return store.findUserById(session.user_id);
}

export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) {
    throw unauthorizedError();
  }
  return user;
}

export async function requireAdmin(): Promise<UserRecord> {
  const user = await requireUser();
  if (user.role !== 'admin') {
    throw forbiddenError('Chỉ quản trị viên mới được phép truy cập tài nguyên này.');
  }
  return user;
}

export async function getExperimentCookieSession(): Promise<ExperimentCookiePayload | null> {
  return readSignedCookie<ExperimentCookiePayload>(EXPERIMENT_COOKIE_NAME);
}

export async function getGuestOrdersCookieSession(): Promise<GuestOrdersCookiePayload | null> {
  return readSignedCookie<GuestOrdersCookiePayload>(GUEST_ORDERS_COOKIE_NAME);
}
