import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { HealthCheckData } from "@/types/api";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

function degradedResponse(timestamp: string) {
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
    { status: 503, headers: NO_STORE_HEADERS }
  );
}

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const admin = getSupabaseAdminClient();

    if (!admin) {
      const data: HealthCheckData = {
        status: "ok",
        timestamp,
        service: "digital-store-advisor",
      };

      return NextResponse.json(
        { ok: true, data },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const { error } = await admin
      .from("products")
      .select("id", { head: true })
      .limit(1);

    if (error) {
      return degradedResponse(timestamp);
    }

    const data: HealthCheckData = {
      status: "ok",
      timestamp,
      service: "digital-store-advisor",
      database: "connected",
    };

    return NextResponse.json(
      { ok: true, data },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch {
    return degradedResponse(timestamp);
  }
}
