import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const DEMO_USERS = [
  {
    email: 'demo@digitalstore.local',
    password: 'Demo1234!',
    role: 'customer',
    full_name: 'Chủ Shop Demo',
  },
  {
    email: 'admin@digitalstore.local',
    password: 'Admin1234!',
    role: 'admin',
    full_name: 'Quản trị viên Nghiên cứu',
  },
];

function loadDotEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf8');
  const parsed = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const cleaned = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIndex = cleaned.indexOf('=');
    if (eqIndex === -1) continue;
    const key = cleaned.slice(0, eqIndex).trim();
    if (!key) continue;
    let value = cleaned.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}

function resolvePromoteEmail(args, getEnv) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--promote=')) {
      return arg.slice('--promote='.length).trim();
    }
    if (arg.startsWith('--admin-promote-email=')) {
      return arg.slice('--admin-promote-email='.length).trim();
    }
    if (arg.startsWith('ADMIN_PROMOTE_EMAIL=')) {
      return arg.slice('ADMIN_PROMOTE_EMAIL='.length).trim();
    }
    if (
      (arg === '--promote' || arg === '--admin-promote-email') &&
      args[i + 1]
    ) {
      return args[i + 1].trim();
    }
    if (!arg.startsWith('-') && arg.includes('@')) {
      return arg.trim();
    }
  }
  return getEnv('ADMIN_PROMOTE_EMAIL');
}

async function listAllAuthUsersByEmail(supabase) {
  const usersByEmail = new Map();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error(`Không thể đọc danh sách auth.users: ${error.message}`);
    }
    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email) {
        usersByEmail.set(user.email.trim().toLowerCase(), user);
      }
    }
    if (users.length < perPage) break;
    page += 1;
  }

  return usersByEmail;
}

async function seedDemoUser(supabase, authUsersByEmail, seed) {
  const normalizedEmail = seed.email.trim().toLowerCase();
  const existingAuthUser = authUsersByEmail.get(normalizedEmail);

  let authUser;
  let authAction;

  if (existingAuthUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingAuthUser.id,
      {
        password: seed.password,
        email_confirm: true,
        user_metadata: {
          ...(existingAuthUser.user_metadata ?? {}),
          full_name: seed.full_name,
        },
      }
    );
    if (error || !data?.user) {
      throw new Error(
        `Không thể cập nhật tài khoản Auth "${normalizedEmail}": ${error?.message ?? 'Lỗi không xác định'}`
      );
    }
    authUser = data.user;
    authAction = 'Cập nhật';
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: seed.password,
      email_confirm: true,
      user_metadata: {
        full_name: seed.full_name,
      },
    });
    if (error || !data?.user) {
      throw new Error(
        `Không thể tạo tài khoản Auth "${normalizedEmail}": ${error?.message ?? 'Lỗi không xác định'}`
      );
    }
    authUser = data.user;
    authUsersByEmail.set(normalizedEmail, authUser);
    authAction = 'Tạo mới';
  }

  const { data: existingProfileByEmail, error: findProfileError } =
    await supabase
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

  if (findProfileError) {
    throw new Error(
      `Không thể kiểm tra bảng public.users cho "${normalizedEmail}": ${findProfileError.message}`
    );
  }

  if (existingProfileByEmail && existingProfileByEmail.id !== authUser.id) {
    const { error: alignError } = await supabase
      .from('users')
      .update({
        id: authUser.id,
        full_name: seed.full_name,
        role: seed.role,
        is_simulated: false,
        deleted_at: null,
      })
      .eq('id', existingProfileByEmail.id);

    if (alignError) {
      throw new Error(
        `Không thể đồng bộ id bảng public.users cho "${normalizedEmail}": ${alignError.message}`
      );
    }
  } else {
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: authUser.id,
        email: normalizedEmail,
        full_name: seed.full_name,
        role: seed.role,
        is_simulated: false,
        deleted_at: null,
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      throw new Error(
        `Không thể upsert public.users cho "${normalizedEmail}": ${upsertError.message}`
      );
    }
  }

  console.log(
    `[OK] ${authAction} tài khoản ${normalizedEmail} (role: ${seed.role}, id: ${authUser.id})`
  );
}

async function promoteAdminByEmail(supabase, authUsersByEmail, rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      `ADMIN_PROMOTE_EMAIL "${rawEmail}" không phải định dạng email hợp lệ.`
    );
  }

  const { data: existingProfile, error: findError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();

  if (findError) {
    throw new Error(
      `Không thể tra cứu email "${email}" trong public.users: ${findError.message}`
    );
  }

  if (existingProfile) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: 'admin',
        deleted_at: null,
      })
      .eq('id', existingProfile.id);

    if (updateError) {
      throw new Error(
        `Không thể nâng quyền admin cho "${email}": ${updateError.message}`
      );
    }

    console.log(
      `[OK] Đã nâng quyền role = 'admin' cho ${email} trong public.users (id: ${existingProfile.id})`
    );
    return;
  }

  const authUser = authUsersByEmail.get(email);
  if (!authUser) {
    throw new Error(
      `Không tìm thấy email "${email}" trong public.users hoặc auth.users. Vui lòng đăng ký tài khoản này trước khi nâng quyền admin.`
    );
  }

  const fullName =
    typeof authUser.user_metadata?.full_name === 'string'
      ? authUser.user_metadata.full_name
      : null;

  const { error: upsertError } = await supabase.from('users').upsert(
    {
      id: authUser.id,
      email,
      full_name: fullName,
      role: 'admin',
      is_simulated: false,
      deleted_at: null,
    },
    { onConflict: 'id' }
  );

  if (upsertError) {
    throw new Error(
      `Không thể tạo hồ sơ admin trong public.users cho "${email}": ${upsertError.message}`
    );
  }

  console.log(
    `[OK] Đã đồng bộ từ auth.users và nâng quyền role = 'admin' cho ${email} (id: ${authUser.id})`
  );
}

async function main() {
  const fileEnv = loadDotEnvFile(resolve(ROOT_DIR, '.env.local'));
  const getEnv = (key) =>
    process.env[key]?.trim() || fileEnv[key]?.trim() || '';

  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    console.error(
      `[LỖI] Thiếu biến môi trường bắt buộc: ${missing.join(', ')}.\n` +
        'Vui lòng bổ sung vào file .env.local hoặc biến môi trường shell rồi chạy lại.'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const authUsersByEmail = await listAllAuthUsersByEmail(supabase);

  for (const seed of DEMO_USERS) {
    await seedDemoUser(supabase, authUsersByEmail, seed);
  }

  const promoteEmail = resolvePromoteEmail(process.argv.slice(2), getEnv);
  if (promoteEmail) {
    await promoteAdminByEmail(supabase, authUsersByEmail, promoteEmail);
  }

  console.log('[HOÀN TẤT] Đã đồng bộ xong tài khoản Supabase Auth & public.users.');
}

main().catch((err) => {
  console.error('[LỖI]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
