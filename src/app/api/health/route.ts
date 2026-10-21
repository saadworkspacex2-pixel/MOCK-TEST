import { NextResponse } from "next/server";
import { pool, ensureDb } from "@/db";

export async function GET() {
  try {
    await ensureDb();
    const result = await pool.query<{ now: Date }>("SELECT now() AS now");
    return NextResponse.json({
      status: "ok",
      database: "connected",
      time: result.rows[0]?.now ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        message: err instanceof Error ? err.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
