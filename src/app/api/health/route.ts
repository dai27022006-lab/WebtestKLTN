import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "digital-store-advisor",
      },
    },
    { status: 200 }
  );
}
