import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { formatDateForReport } from "@/lib/date";

const savingsCategories = [
  "Tabungan",
  "Uang Mamah",
  "Uang Bapa",
  "Persekot Kontrakan",
  "Lainnya",
  "Belum Dikategorikan"
] as const;

export async function GET() {
  await ensureDatabase();

  const savings = await db.select().from(schema.savingsTransactions).all();
  return NextResponse.json({ savings });
}

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    amount?: number;
    category?: string;
    date?: string;
    direction?: "debit" | "credit";
    note?: string;
  };
  const note = body.note?.trim();
  const direction = body.direction ?? "credit";
  const category = body.category;

  if (
    !body.date ||
    !note ||
    typeof body.amount !== "number" ||
    body.amount <= 0 ||
    !category ||
    !savingsCategories.includes(category as (typeof savingsCategories)[number]) ||
    !["debit", "credit"].includes(direction)
  ) {
    return NextResponse.json(
      { error: "Tanggal, kategori, keterangan, dan nominal tabungan wajib diisi." },
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
      category,
      createdAt: new Date(),
      date: formatDateForReport(body.date),
      direction,
      note
    })
    .run();

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as { category?: string; id?: number };

  if (
    !Number.isInteger(body.id) ||
    Number(body.id) <= 0 ||
    !body.category ||
    !savingsCategories.includes(body.category as (typeof savingsCategories)[number])
  ) {
    return NextResponse.json({ error: "Data kategori tabungan tidak valid." }, { status: 400 });
  }

  const transaction = await db
    .select({ id: schema.savingsTransactions.id })
    .from(schema.savingsTransactions)
    .where(eq(schema.savingsTransactions.id, Number(body.id)))
    .get();

  if (!transaction) {
    return NextResponse.json({ error: "Transaksi tabungan tidak ditemukan." }, { status: 404 });
  }

  await db.update(schema.savingsTransactions)
    .set({ category: body.category })
    .where(eq(schema.savingsTransactions.id, transaction.id))
    .run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as { id?: number };

  if (!Number.isInteger(body.id) || Number(body.id) <= 0) {
    return NextResponse.json({ error: "ID transaksi tabungan tidak valid." }, { status: 400 });
  }

  const transaction = await db
    .select({ id: schema.savingsTransactions.id })
    .from(schema.savingsTransactions)
    .where(eq(schema.savingsTransactions.id, Number(body.id)))
    .get();

  if (!transaction) {
    return NextResponse.json({ error: "Transaksi tabungan tidak ditemukan." }, { status: 404 });
  }

  await db
    .delete(schema.savingsTransactions)
    .where(eq(schema.savingsTransactions.id, transaction.id))
    .run();

  return NextResponse.json({ ok: true });
}
