import { NextResponse } from 'next/server';

import { adminExportQuerySchema } from '@/schemas/experiment';
import { requireAdmin } from '@/server/auth/session';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { exportAdminDataset } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = adminExportQuerySchema.safeParse({
      dataset: searchParams.get('dataset') ?? undefined,
      format: searchParams.get('format') ?? undefined,
      include_simulated: searchParams.get('include_simulated') ?? undefined,
    });
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await exportAdminDataset(parsed.data);

    if (parsed.data.format === 'json') {
      const response = apiSuccess(result.jsonPayload, 200);
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    return new NextResponse(result.csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    return handleApiException(err);
  }
}
