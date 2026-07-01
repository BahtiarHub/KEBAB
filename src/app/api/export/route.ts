import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";

const transactionTypeByExport: Record<string, string> = {
  belanja: "Belanja",
  "biaya lain lain": "Biaya Lain Lain",
  "biaya-lain-lain": "Biaya Lain Lain",
  distribusi: "Distribusi",
  "kupat tahu belanja": "Kupat Tahu Belanja",
  "kupat-tahu-belanja": "Kupat Tahu Belanja",
  "kupat tahu penjualan": "Kupat Tahu Penjualan",
  "kupat-tahu-penjualan": "Kupat Tahu Penjualan",
  penjualan: "Penjualan"
};

async function withDetails(type?: string) {
  const transactions = await db.select().from(schema.transactions).all();
  const details = await db.select().from(schema.transactionDetails).all();
  const filtered = type
    ? transactions.filter((transaction) => transaction.type === type)
    : transactions;

  return filtered.map((transaction) => ({
    ...transaction,
    details: details.filter(
      (detail) => detail.transactionNumber === transaction.number
    )
  }));
}

export async function GET(request: Request) {
  await ensureDatabase();

  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get("type")?.toLowerCase() ?? "semua";
  const transactionType = transactionTypeByExport[rawType];

  if (rawType === "neraca") {
    return NextResponse.json({
      data: {
        dailyPerformance: await db.select().from(schema.dailyPerformance).all(),
        monthlyParameters: await db.select().from(schema.monthlyParameters).all(),
        stockOpnames: await db.select().from(schema.stockOpnames).all(),
        transactions: await withDetails()
      },
      exportedAt: new Date().toISOString(),
      type: "neraca"
    });
  }

  if (rawType === "opname-stok" || rawType === "opname stok") {
    return NextResponse.json({
      data: await db.select().from(schema.stockOpnames).all(),
      exportedAt: new Date().toISOString(),
      type: "opname-stok"
    });
  }

  return NextResponse.json({
    data: await withDetails(transactionType),
    exportedAt: new Date().toISOString(),
    type: rawType
  });
}
