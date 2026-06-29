import { NextResponse } from "next/server";

import { ensureDatabase, updateMaterialBuyPrice } from "@/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  await ensureDatabase();

  const { code } = await params;
  const body = (await request.json()) as { buy?: number };

  if (typeof body.buy !== "number" || body.buy < 0) {
    return NextResponse.json({ error: "Invalid buy price" }, { status: 400 });
  }

  await updateMaterialBuyPrice(code, body.buy);

  return NextResponse.json({ ok: true });
}
