import {
  CART_COOKIE_NAME,
  type CartCookiePayload,
  readSignedCookie,
  writeSignedCookie,
} from '@/server/auth/cookies';
import { notFoundError } from '@/server/errors';
import { getStore } from '@/server/store';
import type {
  AddToCartRequest,
  CartDto,
  CartItemDto,
  RemoveFromCartRequest,
} from '@/types/api';

const CART_TTL_SECONDS = 60 * 60 * 24 * 7;

async function hydrateCart(raw: CartCookiePayload | null): Promise<CartDto> {
  const entries = raw?.items ?? [];
  if (entries.length === 0) {
    return {
      items: [],
      item_count: 0,
      subtotal_vnd: 0,
      updated_at: raw?.updated_at ?? new Date().toISOString(),
    };
  }

  const store = getStore();
  const products = await store.findProductsByIds(
    entries.map((e) => e.product_id),
    false
  );
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items: CartItemDto[] = [];
  for (const entry of entries) {
    const product = productMap.get(entry.product_id);
    if (!product) continue;
    const qty = Math.min(Math.max(entry.quantity, 1), 10);
    items.push({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      product_type: product.product_type,
      price_vnd: product.price_vnd,
      quantity: qty,
      line_total_vnd: product.price_vnd * qty,
      thumbnail_url: product.thumbnail_url,
    });
  }

  return {
    items,
    item_count: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal_vnd: items.reduce((sum, i) => sum + i.line_total_vnd, 0),
    updated_at: raw?.updated_at ?? new Date().toISOString(),
  };
}

export async function getCart(): Promise<CartDto> {
  const raw = await readSignedCookie<CartCookiePayload>(CART_COOKIE_NAME);
  return hydrateCart(raw);
}

export async function addToCart(input: AddToCartRequest): Promise<CartDto> {
  const store = getStore();
  const product = await store.findProductByIdOrSlug(input.product_id, false);
  if (!product) {
    throw notFoundError('Không tìm thấy sản phẩm.', 'PRODUCT_NOT_FOUND');
  }

  const raw = await readSignedCookie<CartCookiePayload>(CART_COOKIE_NAME);
  const existing = raw?.items ? [...raw.items] : [];
  const qtyToAdd = input.quantity ?? 1;

  const idx = existing.findIndex((i) => i.product_id === product.id);
  if (idx >= 0) {
    existing[idx] = {
      product_id: product.id,
      quantity: Math.min(existing[idx].quantity + qtyToAdd, 10),
    };
  } else {
    existing.push({
      product_id: product.id,
      quantity: Math.min(qtyToAdd, 10),
    });
  }

  const updatedPayload: CartCookiePayload = {
    items: existing,
    updated_at: new Date().toISOString(),
  };
  await writeSignedCookie(CART_COOKIE_NAME, updatedPayload, CART_TTL_SECONDS);
  return hydrateCart(updatedPayload);
}

export async function removeFromCart(
  input: RemoveFromCartRequest
): Promise<CartDto> {
  const raw = await readSignedCookie<CartCookiePayload>(CART_COOKIE_NAME);
  const existing = raw?.items ?? [];

  const nextItems = input.clear_all
    ? []
    : existing.filter((item) => item.product_id !== input.product_id);

  const updatedPayload: CartCookiePayload = {
    items: nextItems,
    updated_at: new Date().toISOString(),
  };
  await writeSignedCookie(CART_COOKIE_NAME, updatedPayload, CART_TTL_SECONDS);
  return hydrateCart(updatedPayload);
}
