import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { formatDateForReport } from "@/lib/date";

type DistributionItem = {
  code: string;
  name: string;
  qty: number;
};

async function adjustStock(materialCode: string, locationKey: string, delta: number) {
  const current = await db
    .select()
    .from(schema.stockBalances)
    .where(
      and(
        eq(schema.stockBalances.materialCode, materialCode),
        eq(schema.stockBalances.locationKey, locationKey)
      )
    )
    .get();

  if (!current) {
    return;
  }

    await db.update(schema.stockBalances)
    .set({ qty: current.qty + delta })
    .where(eq(schema.stockBalances.id, current.id))
    .run();
}

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    date?: string;
    destination?: string;
    destinationName?: string;
    items?: DistributionItem[];
    officer?: string;
  };

  if (!body.destination || !body.destinationName || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Invalid distribution payload" }, { status: 400 });
  }

  const items = body.items.filter((item) => item.qty > 0);
  const number = `DST-${Date.now()}`;

  await db.insert(schema.transactions)
    .values({
      date: formatDateForReport(body.date),
      location: body.destinationName,
      note: `Distribusi Gudang Utama ke ${body.destinationName}`,
      number,
      total: 0,
      type: "Distribusi"
    })
    .run();

  for (const item of items) {
    await adjustStock(item.code, "gudang", -item.qty);
    await adjustStock(item.code, body.destination, item.qty);
  }

  if (items.length) {
    await db.insert(schema.transactionDetails)
      .values(
        items.map((item) => ({
          activity: "Gudang berkurang, stok tujuan bertambah",
          item: item.name,
          price: 0,
          qty: item.qty,
          transactionNumber: number
        }))
      )
      .run();
  }

  return NextResponse.json({ number, ok: true });
}
