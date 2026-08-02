import { NextResponse } from "next/server";

import {
  ensureDatabase,
  updateMaterialBuyPrice,
  updateMaterialSellPrice
} from "@/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  await ensureDatabase();

  const { code } = await params;
  const body = (await request.json()) as { buy?: number; sell?: number };

  if (body.buy !== undefined) {
    if (typeof body.buy !== "number" || body.buy < 0) {
      return NextResponse.json({ error: "Invalid buy price" }, { status: 400 });
    }

    await updateMaterialBuyPrice(code, body.buy);
  }

  if (body.sell !== undefined) {
    if (typeof body.sell !== "number" || body.sell < 0) {
      return NextResponse.json({ error: "Invalid sell price" }, { status: 400 });
    }

    await updateMaterialSellPrice(code, body.sell);
  }

  if (body.buy === undefined && body.sell === undefined) {
    return NextResponse.json({ error: "Price is required" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
