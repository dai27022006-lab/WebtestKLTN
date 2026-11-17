import { scryptSync, timingSafeEqual } from 'node:crypto';

import { isSupabaseConfigured } from '@/lib/db/env';
import { getSupabaseAdminClient } from '@/lib/db/supabase-admin';
import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import type { LoginInput, RegisterInput } from '@/schemas/auth';
import {
  AUTH_COOKIE_NAME,
  clearCookie,
  writeSignedCookie,
} from '@/server/auth/cookies';
import { toUserProfileDto } from '@/server/auth/session';
import {
  conflictError,
  unauthorizedError,
  unprocessableError,
} from '@/server/errors';
import { getStore } from '@/server/store';
import { hashPasswordLocal } from '@/server/store/seed-data';
import type { AuthSessionResponse } from '@/types/api';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function verifyLocalPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const derived = scryptSync(password, salt, 32).toString('hex');
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(expectedHex, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function registerUser(
  input: RegisterInput
): Promise<AuthSessionResponse> {
  const store = getStore();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const admin = getSupabaseAdminClient();
    if (!supabase || !admin) {
      throw new Error('Supabase client is unavailable');
    }

    const existing = await store.findUserByEmail(normalizedEmail);
    if (existing) {
      throw conflictError('Email này đã được đăng ký.', 'EMAIL_ALREADY_EXISTS');
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          shop_category: input.shop_category ?? null,
        },
      },
    });

    if (error || !data.user) {
      const errorMessage = error?.message ?? '';
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('already')) {
        throw conflictError(
          'Email này đã được đăng ký.',
          'EMAIL_ALREADY_EXISTS'
        );
      }
      if (
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('password')
      ) {
        throw unprocessableError(errorMessage, 'INVALID_SIGNUP_INPUT');
      }
      throw conflictError(
        errorMessage || 'Không thể tạo tài khoản lúc này.',
        'REGISTER_FAILED'
      );
    }

    let created;
    try {
      created = await store.createUser({
        id: data.user.id,
        email: normalizedEmail,
        full_name: input.full_name,
        role: 'customer',
        shop_category: input.shop_category ?? null,
        is_simulated: false,
      });
    } catch (err) {
      await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
      throw err;
    }

    return { user: toUserProfileDto(created) };
  }

  const existing = await store.findUserByEmail(normalizedEmail);
  if (existing) {
    throw conflictError('Email này đã được đăng ký.', 'EMAIL_ALREADY_EXISTS');
  }

  const user = await store.createUser({
    email: normalizedEmail,
    password_hash: hashPasswordLocal(input.password),
    full_name: input.full_name,
    role: 'customer',
    shop_category: input.shop_category ?? null,
    is_simulated: false,
  });

  await writeSignedCookie(
    AUTH_COOKIE_NAME,
    {
      user_id: user.id,
      exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    },
    SESSION_TTL_SECONDS
  );

  return { user: toUserProfileDto(user) };
}

export async function loginUser(
  input: LoginInput
): Promise<AuthSessionResponse> {
  const store = getStore();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Supabase client is unavailable');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: input.password,
    });

    if (error || !data.user) {
      throw unauthorizedError(
        'Email hoặc mật khẩu không chính xác.',
        'INVALID_CREDENTIALS'
      );
    }

    let profile = await store.findUserById(data.user.id);
    if (!profile) {
      profile = await store.createUser({
        id: data.user.id,
        email: normalizedEmail,
        full_name:
          (data.user.user_metadata?.full_name as string | undefined) ?? null,
        role: 'customer',
        shop_category:
          (data.user.user_metadata?.shop_category as string | undefined) ?? null,
        is_simulated: false,
      });
    }

    return { user: toUserProfileDto(profile) };
  }

  const user = await store.findUserByEmail(normalizedEmail);
  if (!user || !verifyLocalPassword(input.password, user.password_hash)) {
    throw unauthorizedError(
      'Email hoặc mật khẩu không chính xác.',
      'INVALID_CREDENTIALS'
    );
  }

  await writeSignedCookie(
    AUTH_COOKIE_NAME,
    {
      user_id: user.id,
      exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    },
    SESSION_TTL_SECONDS
  );

  return { user: toUserProfileDto(user) };
}

export async function logoutUser(): Promise<{ logged_out: boolean }> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  await clearCookie(AUTH_COOKIE_NAME);
  return { logged_out: true };
}
