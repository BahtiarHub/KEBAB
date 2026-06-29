import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { ensureAuthSeed } from "@/lib/auth";

export async function GET() {
  await ensureDatabase();
  await ensureAuthSeed();

  const locations = await db.select().from(schema.locations).all();
  const materials = await db.select().from(schema.materials).all();
  const balances = await db.select().from(schema.stockBalances).all();
  const monthlyParameters = await db.select().from(schema.monthlyParameters).all();
  const dailyPerformance = await db.select().from(schema.dailyPerformance).all();
  const stockOpnames = await db.select().from(schema.stockOpnames).all();
  const users = await db
    .select({
      email: schema.user.email,
      id: schema.user.id,
      name: schema.user.name,
      role: schema.user.role
    })
    .from(schema.user)
    .all();

  const materialPayload = materials.map((material) => {
    const stock = Object.fromEntries(
      locations.map((location) => [
        location.key,
        balances.find(
          (balance) =>
            balance.materialCode === material.code &&
            balance.locationKey === location.key
        )?.qty ?? 0
      ])
    );

    return {
      ...material,
      min: {
        bubulak: material.minBubulak,
        ciherang: material.minCiherang,
        gudang: material.minGudang,
        wadas: material.minWadas
      },
      stock
    };
  });

  const transactions = await db.select().from(schema.transactions).all();
  const transactionDetails = await db.select().from(schema.transactionDetails).all();
  const reports = transactions.map((transaction) => ({
    ...transaction,
    details: transactionDetails.filter(
      (detail) => detail.transactionNumber === transaction.number
    )
  }));

  return NextResponse.json({
    dailyPerformance,
    locations,
    materials: materialPayload,
    monthlyParameters,
    reports,
    stockOpnames,
    users
  });
}

export async function PATCH(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as { parameterKey?: string; amount?: number };

  if (!body.parameterKey || typeof body.amount !== "number") {
    return NextResponse.json({ error: "Invalid parameter payload" }, { status: 400 });
  }

  await db.update(schema.monthlyParameters)
    .set({ amount: body.amount })
    .where(eq(schema.monthlyParameters.key, body.parameterKey))
    .run();

  return NextResponse.json({ ok: true });
}
