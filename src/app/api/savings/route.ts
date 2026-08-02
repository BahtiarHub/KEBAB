import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { formatDateForReport } from "@/lib/date";

export async function GET() {
  await ensureDatabase();

  const savings = await db.select().from(schema.savingsTransactions).all();
  return NextResponse.json({ savings });
}

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    amount?: number;
    date?: string;
    direction?: "debit" | "credit";
    note?: string;
  };
  const note = body.note?.trim();
  const direction = body.direction ?? "credit";

  if (
    !body.date ||
    !note ||
    typeof body.amount !== "number" ||
    body.amount <= 0 ||
    !["debit", "credit"].includes(direction)
  ) {
    return NextResponse.json(
      { error: "Tanggal, keterangan, dan nominal tabungan wajib diisi." },
      { status: 400 }
    );
  }

  if (direction === "debit") {
    const transactions = await db.select().from(schema.savingsTransactions).all();
    const balance = transactions.reduce(
      (total, transaction) =>
        total + (transaction.direction === "credit" ? transaction.amount : -transaction.amount),
      0
    );

    if (body.amount > balance) {
      return NextResponse.json(
        { error: "Saldo tabungan tidak mencukupi untuk transaksi debet." },
        { status: 400 }
      );
    }
  }

  await db.insert(schema.savingsTransactions)
    .values({
      amount: Math.round(body.amount),
      createdAt: new Date(),
      date: formatDateForReport(body.date),
      direction,
      note
    })
    .run();

  return NextResponse.json({ ok: true });
}
