import { createHmac, timingSafeEqual } from 'node:crypto';

import { getServerSigningSecret, isSupabaseConfigured } from '@/lib/db/env';
import { getSupabaseAdminClient } from '@/lib/db/supabase-admin';
import {
  forbiddenError,
  notFoundError,
  unprocessableError,
} from '@/server/errors';
import { getStore } from '@/server/store';
import type { DownloadAccessResponse } from '@/types/api';

function signDeliveryParams(token: string, exp: number): string {
  return createHmac('sha256', getServerSigningSecret())
    .update(`deliver:${token}:${exp}`)
    .digest('hex');
}

export function verifyDeliverySignature(
  token: string,
  expRaw: string | null,
  sigRaw: string | null
): boolean {
  if (!expRaw || !sigRaw) return false;
  const exp = Number.parseInt(expRaw, 10);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const expected = signDeliveryParams(token, exp);
  const a = Buffer.from(sigRaw, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function grantDownloadAccess(
  token: string
): Promise<DownloadAccessResponse> {
  const store = getStore();
  const record = await store.findDownloadGrantByToken(token);
  if (!record) {
    throw notFoundError(
      'Token tải file không tồn tại hoặc đã bị thu hồi.',
      'DOWNLOAD_TOKEN_NOT_FOUND'
    );
  }

  const { grant, order, file } = record;
  if (order.status !== 'paid') {
    throw forbiddenError(
      'Đơn hàng chưa hoàn tất thanh toán.',
      'ORDER_NOT_PAID'
    );
  }

  if (new Date(grant.expires_at).getTime() <= Date.now()) {
    throw unprocessableError(
      'Liên kết tải xuống đã hết hạn.',
      'DOWNLOAD_EXPIRED'
    );
  }

  if (grant.download_count >= grant.max_downloads) {
    throw unprocessableError(
      'Bạn đã sử dụng hết số lượt tải cho phép của đơn hàng này.',
      'DOWNLOAD_LIMIT_EXCEEDED'
    );
  }

  const updatedGrant = await store.incrementDownloadGrantCount(grant.id);
  if (!updatedGrant) {
    throw unprocessableError(
      'Bạn đã sử dụng hết số lượt tải cho phép của đơn hàng này.',
      'DOWNLOAD_LIMIT_EXCEEDED'
    );
  }

  const remainingDownloads = Math.max(
    0,
    updatedGrant.max_downloads - updatedGrant.download_count
  );

  // Use Supabase Storage Signed URL when running in Supabase mode & object exists
  if (isSupabaseConfigured()) {
    const admin = getSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin.storage
        .from(file.storage_bucket)
        .createSignedUrl(file.storage_path, 60);
      if (!error && data?.signedUrl) {
        return {
          download_url: data.signedUrl,
          file_name: file.file_name,
          mime_type: file.mime_type,
          file_size_bytes: file.file_size_bytes,
          expires_at: updatedGrant.expires_at,
          remaining_downloads: remainingDownloads,
        };
      }
    }
  }

  // Fallback: signed placeholder deliverable endpoint on localhost
  const deliverExp = Date.now() + 5 * 60 * 1000;
  const deliverSig = signDeliveryParams(token, deliverExp);

  return {
    download_url: `/api/downloads/${encodeURIComponent(token)}?deliver=1&exp=${deliverExp}&sig=${deliverSig}`,
    file_name: file.file_name,
    mime_type: file.mime_type,
    file_size_bytes: file.file_size_bytes,
    expires_at: updatedGrant.expires_at,
    remaining_downloads: remainingDownloads,
  };
}

export async function buildDeliverablePayload(token: string) {
  const store = getStore();
  const record = await store.findDownloadGrantByToken(token);
  if (!record) {
    throw notFoundError(
      'Token tải file không tồn tại hoặc đã bị thu hồi.',
      'DOWNLOAD_TOKEN_NOT_FOUND'
    );
  }

  return {
    fileName: record.file.file_name,
    mimeType: record.file.mime_type,
    content: JSON.stringify(
      {
        deliverable: record.product.name,
        slug: record.product.slug,
        version: record.file.version,
        source_type: record.product.source_type,
        license_note: record.product.license_note,
        order_code: record.order.order_code,
        downloaded_at: new Date().toISOString(),
        specs: record.product.specs,
        note: 'Tệp bàn giao mẫu (Placeholder Dev Deliverable) phục vụ kiểm thử luồng giao hàng số F6.',
      },
      null,
      2
    ),
  };
}
