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

type TransactionWithDetails = Awaited<ReturnType<typeof withDetails>>[number];
type ExportTable = {
  rows: Array<Record<string, unknown>>;
  title: string;
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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeCell(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function tableHtml({ rows, title }: ExportTable) {
  const headers = Array.from(
    rows.reduce<Set<string>>((result, row) => {
      Object.keys(row).forEach((key) => result.add(key));
      return result;
    }, new Set())
  );

  return `
    <h2>${escapeHtml(title)}</h2>
    <table border="1">
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows
                .map(
                  (row) =>
                    `<tr>${headers
                      .map(
                        (header) =>
                          `<td>${escapeHtml(normalizeCell(row[header]))}</td>`
                      )
                      .join("")}</tr>`
                )
                .join("")
            : `<tr><td colspan="${Math.max(headers.length, 1)}">Tidak ada data</td></tr>`
        }
      </tbody>
    </table>
    <br />
  `;
}

function transactionRows(transactions: TransactionWithDetails[]) {
  return transactions.map((transaction) => ({
    Tanggal: transaction.date,
    Nomor: transaction.number,
    Tipe: transaction.type,
    Lokasi: transaction.location,
    Keterangan: transaction.note,
    Total: transaction.total
  }));
}

function transactionDetailRows(transactions: TransactionWithDetails[]) {
  return transactions.flatMap((transaction) =>
    transaction.details.map((detail) => ({
      Tanggal: transaction.date,
      Nomor: transaction.number,
      Tipe: transaction.type,
      Lokasi: transaction.location,
      Item: detail.item,
      Jumlah: detail.qty,
      Harga: detail.price,
      Total: detail.qty * detail.price,
      Aktivitas: detail.activity
    }))
  );
}

function stockOpnameRows(rows: Array<typeof schema.stockOpnames.$inferSelect>) {
  return rows.map((row) => ({
    Tanggal: row.date,
    Nomor: row.number,
    Lokasi: row.location,
    "Bahan Baku": row.material,
    "Stok Sistem": row.systemStock,
    "Stok Fisik": row.physicalStock,
    Selisih: row.difference,
    Petugas: row.officer
  }));
}

function excelResponse(type: string, tables: ExportTable[]) {
  const exportedAt = new Date();
  const body = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; margin-bottom: 18px; }
          th { background: #facc15; font-weight: 700; }
          th, td { border: 1px solid #1f2937; padding: 6px 8px; }
          h1, h2 { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>Export Excel ${escapeHtml(type)}</h1>
        <p>Diekspor: ${escapeHtml(exportedAt.toISOString())}</p>
        ${tables.map(tableHtml).join("")}
      </body>
    </html>`;
  const filename = `${type
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${exportedAt.getTime()}.xls`;

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/vnd.ms-excel; charset=utf-8"
    }
  });
}

export async function GET(request: Request) {
  await ensureDatabase();

  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get("type")?.toLowerCase() ?? "semua";
  const transactionType = transactionTypeByExport[rawType];

  if (rawType === "neraca") {
    const transactions = await withDetails();
    const stockOpnames = await db.select().from(schema.stockOpnames).all();
    return excelResponse("neraca", [
      {
        rows: await db.select().from(schema.dailyPerformance).all(),
        title: "Daily Performance"
      },
      {
        rows: await db.select().from(schema.monthlyParameters).all(),
        title: "Parameter Bulanan"
      },
      {
        rows: transactionRows(transactions),
        title: "Transaksi"
      },
      {
        rows: transactionDetailRows(transactions),
        title: "Detail Transaksi"
      },
      {
        rows: stockOpnameRows(stockOpnames),
        title: "Opname Stok"
      }
    ]);
  }

  if (rawType === "opname-stok" || rawType === "opname stok") {
    const stockOpnames = await db.select().from(schema.stockOpnames).all();
    return excelResponse("opname-stok", [
      {
        rows: stockOpnameRows(stockOpnames),
        title: "Opname Stok"
      }
    ]);
  }

  if (rawType === "semua-penjualan" || rawType === "semua penjualan") {
    const transactions = (await withDetails()).filter(
      (transaction) =>
        transaction.type === "Penjualan" ||
        transaction.type === "Kupat Tahu Penjualan"
    );
    return excelResponse("semua-penjualan", [
      {
        rows: transactionRows(transactions),
        title: "Penjualan"
      },
      {
        rows: transactionDetailRows(transactions),
        title: "Detail Penjualan"
      }
    ]);
  }

  const transactions = await withDetails(transactionType);
  return excelResponse(rawType, [
    {
      rows: transactionRows(transactions),
      title: "Transaksi"
    },
    {
      rows: transactionDetailRows(transactions),
      title: "Detail Transaksi"
    }
  ]);
}
