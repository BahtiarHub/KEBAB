import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";

export async function POST(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    amount?: number;
    kind?: string;
    location?: string;
    source?: string;
  };

  if (!body.kind || !body.location || typeof body.amount !== "number") {
    return NextResponse.json({ error: "Invalid expense payload" }, { status: 400 });
  }

  const number = `BYA-${Date.now()}`;

  await db.insert(schema.transactions)
    .values({
      date: new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date()),
      location: body.location,
      note: body.kind,
      number,
      total: body.amount,
      type: "Biaya Lain Lain"
    })
    .run();

  await db.insert(schema.transactionDetails)
    .values({
      activity: `${body.source ?? "Manual"} - pengurang laba bulanan`,
      item: body.kind,
      price: body.amount,
      qty: 1,
      transactionNumber: number
    })
    .run();

  return NextResponse.json({ number, ok: true });
}
