import { addToCartSchema, removeFromCartSchema } from '@/schemas/order';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import {
  addToCart,
  getCart,
  removeFromCart,
} from '@/server/services/cart.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cart = await getCart();
    return apiSuccess(cart, 200);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const cart = await addToCart(parsed.data);
    return apiSuccess(cart, 200);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawText = await req.text();
    let payload: unknown;

    if (rawText.trim().length > 0) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        return apiValidationError(
          removeFromCartSchema.safeParse({}).error!
        );
      }
    } else {
      payload = {
        product_id: searchParams.get('product_id') || undefined,
        clear_all: searchParams.get('clear_all') === 'true' ? true : undefined,
      };
    }

    const parsed = removeFromCartSchema.safeParse(payload);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const cart = await removeFromCart(parsed.data);
    return apiSuccess(cart, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
