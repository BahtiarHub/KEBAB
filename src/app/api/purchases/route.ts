import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase, updateMaterialBuyPrice } from "@/db";
import * as schema from "@/db/schema";
import { formatDateForReport } from "@/lib/date";

type PurchaseItem = {
  code: string;
  name: string;
  price: number;
  qty: number;
};

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    date?: string;
    items?: PurchaseItem[];
    note?: string;
    officer?: string;
    shippingCost?: number;
  };

  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "Invalid purchase payload" }, { status: 400 });
  }

  const purchasedItems = body.items.filter((item) => item.qty > 0);
  const number = `BLJ-${Date.now()}`;
  const subtotal = purchasedItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const total = subtotal + (body.shippingCost ?? 0);

  await db.insert(schema.transactions)
    .values({
      date: formatDateForReport(body.date),
      location: "Gudang Utama",
      note: body.note || "Belanja bahan baku",
      number,
      total,
      type: "Belanja"
    })
    .run();

  for (const item of body.items) {
    await updateMaterialBuyPrice(item.code, item.price);
  }

  for (const item of purchasedItems) {
    const current = await db
      .select()
      .from(schema.stockBalances)
      .where(
        and(
          eq(schema.stockBalances.materialCode, item.code),
          eq(schema.stockBalances.locationKey, "gudang")
        )
      )
      .get();

    if (current) {
      await db.update(schema.stockBalances)
        .set({ qty: current.qty + item.qty })
        .where(eq(schema.stockBalances.id, current.id))
        .run();
    }
  }

  const detailRows = purchasedItems.map((item) => ({
    activity: "Stok gudang bertambah dari transaksi belanja",
    item: item.name,
    price: item.price,
    qty: item.qty,
    transactionNumber: number
  }));

  if (body.shippingCost) {
    detailRows.push({
      activity: "Ongkir tercatat sebagai biaya belanja",
      item: "Ongkir",
      price: body.shippingCost,
      qty: 1,
      transactionNumber: number
    });
  }

  if (detailRows.length) {
    await db.insert(schema.transactionDetails).values(detailRows).run();
  }

  return NextResponse.json({ number, ok: true });
}
