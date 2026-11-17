import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

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

async function findExistingProduct(supabase, item) {
  const byId = await supabase
    .from('products')
    .select('id, slug')
    .eq('id', item.id)
    .maybeSingle();

  if (byId.error) {
    throw new Error(
      `Lỗi truy vấn sản phẩm theo id (${item.slug}): ${byId.error.message}`
    );
  }
  if (byId.data) return byId.data;

  const bySlug = await supabase
    .from('products')
    .select('id, slug')
    .eq('slug', item.slug)
    .maybeSingle();

  if (bySlug.error) {
    throw new Error(
      `Lỗi truy vấn sản phẩm theo slug (${item.slug}): ${bySlug.error.message}`
    );
  }
  return bySlug.data;
}

async function syncProduct(supabase, item) {
  const existing = await findExistingProduct(supabase, item);

  const updatePayload = {
    demo_url: item.demo_url ?? null,
    thumbnail_url: item.thumbnail_url ?? null,
    specs: item.specs ?? {},
    short_description: item.short_description,
    description: item.description,
    license_note: item.license_note,
  };

  if (existing) {
    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', existing.id)
      .select('id, slug, demo_url, thumbnail_url, specs')
      .single();

    if (error || !data) {
      throw new Error(
        `Không thể cập nhật sản phẩm "${item.slug}": ${error?.message ?? 'Lỗi không xác định'}`
      );
    }

    return { action: 'updated', row: data };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('products')
    .insert({
      id: item.id,
      slug: item.slug,
      name: item.name,
      short_description: item.short_description,
      description: item.description,
      product_type: item.product_type,
      industry: item.industry,
      price_vnd: item.price_vnd,
      demo_url: item.demo_url ?? null,
      thumbnail_url: item.thumbnail_url ?? null,
      source_type: item.source_type,
      license_note: item.license_note,
      specs: item.specs ?? {},
      is_active: item.is_active !== false,
      is_simulated: Boolean(item.is_simulated),
    })
    .select('id, slug, demo_url, thumbnail_url, specs')
    .single();

  if (insertError || !inserted) {
    throw new Error(
      `Không thể thêm mới sản phẩm "${item.slug}": ${insertError?.message ?? 'Lỗi không xác định'}`
    );
  }

  if (item.deliverable_file) {
    const { error: fileError } = await supabase.from('product_files').insert({
      id: item.file_id,
      product_id: inserted.id,
      file_name: item.deliverable_file.file_name,
      storage_bucket: item.deliverable_file.storage_bucket,
      storage_path: item.deliverable_file.storage_path,
      file_size_bytes: item.deliverable_file.file_size_bytes,
      mime_type: item.deliverable_file.mime_type,
      version: item.deliverable_file.version,
      is_primary: true,
    });
    if (fileError) {
      throw new Error(
        `Đã thêm sản phẩm "${item.slug}" nhưng lỗi tạo product_files: ${fileError.message}`
      );
    }
  }

  return { action: 'inserted', row: inserted };
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
      `[LỖI] Thiếu biến môi trường bắt buộc: ${missing.join(', ')}.`
    );
    process.exit(1);
  }

  const catalogPath = resolve(ROOT_DIR, 'data/catalog-v1.json');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const products = Array.isArray(catalog.products) ? catalog.products : [];

  if (products.length === 0) {
    throw new Error('data/catalog-v1.json không có sản phẩm nào.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let updatedCount = 0;
  let insertedCount = 0;

  for (const item of products) {
    const { action, row } = await syncProduct(supabase, item);
    if (action === 'updated') updatedCount += 1;
    if (action === 'inserted') insertedCount += 1;

    const specs = row.specs ?? {};
    const csCount = Array.isArray(specs.case_studies)
      ? specs.case_studies.length
      : 0;
    const hlCount = Array.isArray(specs.preview_highlights)
      ? specs.preview_highlights.length
      : 0;

    console.log(
      `[OK] ${action.toUpperCase()} ${row.slug} | demo_url=${row.demo_url ?? 'null'} | thumbnail_url=${row.thumbnail_url ?? 'null'} | case_studies=${csCount} | highlights=${hlCount}`
    );
  }

  console.log(
    `[HOÀN TẤT] Đã đồng bộ ${updatedCount + insertedCount}/${products.length} sản phẩm lên Supabase (updated=${updatedCount}, inserted=${insertedCount}).`
  );
}

main().catch((err) => {
  console.error('[LỖI]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
