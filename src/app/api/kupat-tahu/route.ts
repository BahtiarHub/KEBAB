import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { formatDateForReport } from "@/lib/date";

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    amount?: number;
    date?: string;
    kind?: "Belanja" | "Penjualan";
    note?: string;
    otherCost?: number;
    portionQty?: number;
    qris?: number;
    salary?: number;
  };

  if (body.kind === "Belanja") {
    if (typeof body.amount !== "number") {
      return NextResponse.json({ error: "Invalid Kupat Tahu purchase" }, { status: 400 });
    }

    const number = `KTB-${Date.now()}`;

    await db.insert(schema.transactions)
      .values({
        date: formatDateForReport(body.date),
        location: "Kupat Tahu",
        note: body.note || "Belanja Kupat Tahu",
        number,
        total: body.amount,
        type: "Kupat Tahu Belanja"
      })
      .run();

    await db.insert(schema.transactionDetails)
      .values({
        activity: "Belanja Kupat Tahu tercatat sebagai aktivitas",
        item: "Belanja Kupat Tahu",
        price: body.amount,
        qty: 1,
        transactionNumber: number
      })
      .run();

    return NextResponse.json({ number, ok: true });
  }

  if (body.kind === "Penjualan") {
    if (typeof body.portionQty !== "number") {
      return NextResponse.json({ error: "Invalid Kupat Tahu sales" }, { status: 400 });
    }

    const number = `KTP-${Date.now()}`;
    const pricePerPortion = 10000;
    const omset = body.portionQty * pricePerPortion;
    const modal = Math.round(omset * 0.6);
    const grossProfit = Math.round(omset * 0.4);
    const salary = body.salary ?? 0;
    const qris = body.qris ?? 0;
    const otherCost = body.otherCost ?? 0;
    const netIncome = grossProfit - salary - otherCost;
    const cash = omset - salary - qris - otherCost;
    const date = formatDateForReport(body.date);

    await db.insert(schema.transactions)
      .values({
        date,
        location: "Kupat Tahu",
        note: body.note || "Penjualan Kupat Tahu",
        number,
        total: omset,
        type: "Kupat Tahu Penjualan"
      })
      .run();

    await db.insert(schema.transactionDetails)
      .values([
        {
          activity: "Jumlah porsi terjual",
          item: "Porsi Kupat Tahu",
          price: pricePerPortion,
          qty: body.portionQty,
          transactionNumber: number
        },
        {
          activity: "Modal 60% dari omset",
          item: "Modal Kupat Tahu",
          price: modal,
          qty: 1,
          transactionNumber: number
        },
        {
          activity: "Laba kotor 40% dari omset",
          item: "Laba Kotor Kupat Tahu",
          price: grossProfit,
          qty: 1,
          transactionNumber: number
        },
        {
          activity: "Pengurang pendapatan dan cash",
          item: "Gaji Kupat Tahu",
          price: salary,
          qty: 1,
          transactionNumber: number
        },
        {
          activity: "Pengurang cash",
          item: "QRIS Kupat Tahu",
          price: qris,
          qty: 1,
          transactionNumber: number
        },
        {
          activity: "Pengurang pendapatan dan cash",
          item: "Lain lain Kupat Tahu",
          price: otherCost,
          qty: 1,
          transactionNumber: number
        },
        {
          activity: "Pendapatan bersih Kupat Tahu",
          item: "Pendapatan Bersih Kupat Tahu",
          price: netIncome,
          qty: 1,
          transactionNumber: number
        },
        {
          activity: "Cash Kupat Tahu",
          item: "Cash Kupat Tahu",
          price: cash,
          qty: 1,
          transactionNumber: number
        }
      ])
      .run();

    await db.insert(schema.dailyPerformance)
      .values({
        date,
        kiosk: "Kupat Tahu",
        laba: netIncome,
        omset
      })
      .run();

    return NextResponse.json({ number, ok: true });
  }

  return NextResponse.json({ error: "Invalid Kupat Tahu payload" }, { status: 400 });
}
