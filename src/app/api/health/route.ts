import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { HealthCheckData } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const admin = getSupabaseAdminClient();

  if (!admin) {
    const data: HealthCheckData = {
      status: "ok",
      timestamp,
      service: "digital-store-advisor",
    };

    return NextResponse.json({ ok: true, data }, { status: 200 });
  }

  try {
    const { error } = await admin.from("products").select("id", { head: true }).limit(1);

    if (error) {
      const data: HealthCheckData = {
        status: "degraded",
        timestamp,
        service: "digital-store-advisor",
        database: "error",
      };

      return NextResponse.json(
        {
          ok: false,
          data,
          error: {
            code: "DB_UNAVAILABLE",
            message: "Database health check failed.",
          },
        },
        { status: 503 }
      );
    }

    const data: HealthCheckData = {
      status: "ok",
      timestamp,
      service: "digital-store-advisor",
      database: "connected",
    };

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch {
    const data: HealthCheckData = {
      status: "degraded",
      timestamp,
      service: "digital-store-advisor",
      database: "error",
    };

    return NextResponse.json(
      {
        ok: false,
        data,
        error: {
          code: "DB_UNAVAILABLE",
          message: "Database health check failed.",
        },
      },
      { status: 503 }
    );
  }
}
