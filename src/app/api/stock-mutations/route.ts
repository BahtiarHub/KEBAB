import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { parseReportDate } from "@/lib/date";

const kioskKeys = ["wadas", "ciherang", "bubulak"] as const;
const dayInMilliseconds = 24 * 60 * 60 * 1000;

type StockMutationRow = {
  date: string;
  dateValue: number;
  inQty: number;
  note: string;
  number: string;
  outQty: number;
  source: "Distribusi" | "Penjualan" | "Opname";
};

function getTransactionOrder(number: string) {
  const timestamp = Number(number.split("-").at(-1));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export async function GET(request: Request) {
  await ensureDatabase();

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const locationKey = searchParams.get("locationKey") ?? "";
  const materialCode = searchParams.get("materialCode") ?? "";
  const parsedStartDate = parseReportDate(startDate);
  const parsedEndDate = parseReportDate(endDate);

  if (
    !parsedStartDate ||
    !parsedEndDate ||
    !kioskKeys.includes(locationKey as (typeof kioskKeys)[number]) ||
    !materialCode
  ) {
    return NextResponse.json({ error: "Filter mutasi stok tidak valid." }, { status: 400 });
  }

  const periodLength =
    Math.floor((parsedEndDate.getTime() - parsedStartDate.getTime()) / dayInMilliseconds) + 1;
  if (periodLength < 1 || periodLength > 7) {
    return NextResponse.json(
      { error: "Periode mutasi stok harus antara satu sampai tujuh hari." },
      { status: 400 }
    );
  }

  const [location, material, currentBalance] = await Promise.all([
    db.select().from(schema.locations).where(eq(schema.locations.key, locationKey)).get(),
    db.select().from(schema.materials).where(eq(schema.materials.code, materialCode)).get(),
    db.select().from(schema.stockBalances)
      .where(
        and(
          eq(schema.stockBalances.locationKey, locationKey),
          eq(schema.stockBalances.materialCode, materialCode)
        )
      )
      .get()
  ]);

  if (!location || !material) {
    return NextResponse.json({ error: "Kios atau bahan baku tidak ditemukan." }, { status: 404 });
  }

  const transactions = await db.select().from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.location, location.name),
        inArray(schema.transactions.type, ["Distribusi", "Penjualan"])
      )
    )
    .all();
  const transactionNumbers = transactions.map((transaction) => transaction.number);
  const transactionDetails = transactionNumbers.length
    ? await db.select().from(schema.transactionDetails)
        .where(
          and(
            inArray(schema.transactionDetails.transactionNumber, transactionNumbers),
            eq(schema.transactionDetails.item, material.name)
          )
        )
        .all()
    : [];
  const stockOpnames = await db.select().from(schema.stockOpnames)
    .where(
      and(
        eq(schema.stockOpnames.location, location.name),
        eq(schema.stockOpnames.material, material.name)
      )
    )
    .all();

  const transactionRows: StockMutationRow[] = transactions.flatMap((transaction) => {
    const date = parseReportDate(transaction.date);
    if (!date || (transaction.type !== "Distribusi" && transaction.type !== "Penjualan")) {
      return [];
    }
    const source = transaction.type;

    return transactionDetails
      .filter(
        (detail) =>
          detail.transactionNumber === transaction.number &&
          detail.qty > 0
      )
      .map((detail) => ({
        date: transaction.date,
        dateValue: date.getTime(),
        inQty: source === "Distribusi" ? detail.qty : 0,
        note:
          source === "Penjualan"
            ? "Penjualan"
            : "Distribusi masuk dari Gudang Utama",
        number: transaction.number,
        outQty: source === "Penjualan" ? detail.qty : 0,
        source
      }));
  });
  const opnameRows: StockMutationRow[] = stockOpnames.flatMap((opname) => {
    const date = parseReportDate(opname.date);
    if (!date || opname.difference === 0) {
      return [];
    }

    return [{
      date: opname.date,
      dateValue: date.getTime(),
      inQty: Math.max(opname.difference, 0),
      note: `Penyesuaian stok sistem ${opname.systemStock} menjadi ${opname.physicalStock}`,
      number: opname.number,
      outQty: Math.max(-opname.difference, 0),
      source: "Opname" as const
    }];
  });
  const allMovements = [...transactionRows, ...opnameRows].sort(
    (first, second) =>
      first.dateValue - second.dateValue ||
      getTransactionOrder(first.number) - getTransactionOrder(second.number)
  );
  const startValue = parsedStartDate.getTime();
  const endValue = parsedEndDate.getTime() + dayInMilliseconds - 1;
  const currentStock = currentBalance?.qty ?? 0;
  const openingStock =
    currentStock -
    allMovements
      .filter((movement) => movement.dateValue >= startValue)
      .reduce((total, movement) => total + movement.inQty - movement.outQty, 0);
  let runningStock = openingStock;
  const rows = allMovements
    .filter((movement) => movement.dateValue >= startValue && movement.dateValue <= endValue)
    .map((movement) => {
      runningStock += movement.inQty - movement.outQty;
      return {
        balance: runningStock,
        date: movement.date,
        inQty: movement.inQty,
        note: movement.note,
        number: movement.number,
        outQty: movement.outQty,
        source: movement.source
      };
    });
  const totalIn = rows.reduce((total, movement) => total + movement.inQty, 0);
  const totalOut = rows.reduce((total, movement) => total + movement.outQty, 0);
  const latestOpname = stockOpnames
    .filter((opname) => {
      const date = parseReportDate(opname.date);
      return date && date.getTime() >= startValue && date.getTime() <= endValue;
    })
    .sort((first, second) => {
      const dateDifference =
        (parseReportDate(second.date)?.getTime() ?? 0) -
        (parseReportDate(first.date)?.getTime() ?? 0);
      return dateDifference || getTransactionOrder(second.number) - getTransactionOrder(first.number);
    })[0];

  return NextResponse.json({
    material: { code: material.code, name: material.name },
    location: { key: location.key, name: location.name },
    period: { days: periodLength, endDate, startDate },
    reconciliation: latestOpname
      ? {
          difference: latestOpname.difference,
          label:
            latestOpname.difference === 0
              ? "Sesuai"
              : `Selisih ${latestOpname.difference}`,
          number: latestOpname.number,
          opnameDate: latestOpname.date,
          status: latestOpname.difference === 0 ? "success" : "danger"
        }
      : {
          difference: null,
          label: "Belum Dicek",
          number: null,
          opnameDate: null,
          status: "warning"
        },
    rows,
    summary: {
      currentStock,
      endingStock: openingStock + totalIn - totalOut,
      openingStock,
      totalIn,
      totalOut
    }
  });
}
