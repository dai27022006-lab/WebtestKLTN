import { downloadTokenParamSchema } from '@/schemas/order';
import {
  apiError,
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import {
  buildDeliverablePayload,
  grantDownloadAccess,
  verifyDeliverySignature,
} from '@/server/services/download.service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const params = await context.params;
    const parsed = downloadTokenParamSchema.safeParse(params);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('deliver') === '1') {
      const exp = searchParams.get('exp');
      const sig = searchParams.get('sig');
      if (!verifyDeliverySignature(parsed.data.token, exp, sig)) {
        return apiError(
          'FORBIDDEN',
          'Liên kết tải xuống không hợp lệ hoặc đã hết hạn.',
          403
        );
      }

      const payload = await buildDeliverablePayload(parsed.data.token);
      return new Response(payload.content, {
        status: 200,
        headers: {
          'Content-Type': `${payload.mimeType}; charset=utf-8`,
          'Content-Disposition': `attachment; filename="${payload.fileName}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const access = await grantDownloadAccess(parsed.data.token);
    return apiSuccess(access, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
