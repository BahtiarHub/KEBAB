import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";

type SaleItem = {
  buy: number;
  code: string;
  name: string;
  qty: number;
  sell: number | null;
};

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    cashOwner?: number;
    costs?: { grabGofood: number; otherCost: number; salary: number };
    items?: SaleItem[];
    kiosk?: string;
    kioskKey?: string;
    modal?: number;
    totalSales?: number;
  };

  if (!body.kiosk || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Invalid sales payload" }, { status: 400 });
  }

  const number = `PNJ-${Date.now()}`;
  const soldItems = body.items.filter((item) => item.qty > 0);
  const totalSales = body.totalSales ?? 0;
  const modal = body.modal ?? 0;
  const date = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());

  await db.insert(schema.transactions)
    .values({
      date,
      location: body.kiosk,
      note: `Penjualan ${body.kiosk}`,
      number,
      total: totalSales,
      type: "Penjualan"
    })
    .run();

  if (soldItems.length) {
    await db.insert(schema.transactionDetails)
      .values(
        soldItems.map((item) => ({
          activity: `Keluar ${item.qty} item dari ${body.kiosk}`,
          item: item.name,
          price: item.sell ?? item.buy,
          qty: item.qty,
          transactionNumber: number
        }))
      )
      .run();
  }

  const costs = body.costs;
  const costDetails: Array<[string, number, string]> = [];
  if (modal > 0) {
    costDetails.push([
      "Modal Penjualan",
      modal,
      "Modal bahan baku sebagai pengurang laba"
    ]);
  }

  if (costs) {
    if (costs.salary > 0) {
      costDetails.push([
        "Gaji Karyawan",
        costs.salary,
        "Pengurang laba penjualan"
      ]);
    }
    if (costs.grabGofood > 0) {
      costDetails.push([
        "Grab/GoFood",
        costs.grabGofood,
        "Pengurang cash owner"
      ]);
    }
    if (costs.otherCost > 0) {
      costDetails.push([
        "Lain lain",
        costs.otherCost,
        "Pengurang laba penjualan"
      ]);
    }
  }

  if (costDetails.length) {
    await db.insert(schema.transactionDetails)
      .values(
        costDetails.map(([item, amount, activity]) => ({
          activity,
          item,
          price: Number(amount),
          qty: 1,
          transactionNumber: number
        }))
      )
      .run();
  }

  if (body.kioskKey) {
    for (const item of soldItems) {
      const current = await db
        .select()
        .from(schema.stockBalances)
        .where(
          and(
            eq(schema.stockBalances.materialCode, item.code),
            eq(schema.stockBalances.locationKey, body.kioskKey)
          )
        )
        .get();

      if (current) {
        await db.update(schema.stockBalances)
          .set({ qty: Math.max(current.qty - item.qty, 0) })
          .where(eq(schema.stockBalances.id, current.id))
          .run();
      }
    }
  }

  const laba =
    totalSales -
    modal -
    (costs?.salary ?? 0) -
    (costs?.otherCost ?? 0);

  await db.insert(schema.dailyPerformance)
    .values({
      date,
      kiosk: body.kiosk,
      laba,
      omset: totalSales
    })
    .run();

  return NextResponse.json({ number, ok: true });
}
