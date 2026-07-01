import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { formatDateForReport } from "@/lib/date";

type OpnameItem = {
  materialCode: string;
  materialName: string;
  physicalStock: number;
  systemStock: number;
};

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    date?: string;
    items?: OpnameItem[];
    locationKey?: string;
    locationName?: string;
    officer?: string;
  };

  if (!body.locationKey || !body.locationName || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Invalid opname payload" }, { status: 400 });
  }

  const number = `OPN-${Date.now()}`;
  const date = formatDateForReport(body.date);

  for (const item of body.items) {
    await db.update(schema.stockBalances)
      .set({ qty: item.physicalStock })
      .where(
        and(
          eq(schema.stockBalances.materialCode, item.materialCode),
          eq(schema.stockBalances.locationKey, body.locationKey)
        )
      )
      .run();

    await db.insert(schema.stockOpnames)
      .values({
        date,
        difference: item.physicalStock - item.systemStock,
        location: body.locationName,
        material: item.materialName,
        number,
        officer: body.officer ?? "Admin",
        physicalStock: item.physicalStock,
        systemStock: item.systemStock
      })
      .run();
  }

  return NextResponse.json({ number, ok: true });
}
