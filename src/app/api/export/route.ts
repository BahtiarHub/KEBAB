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
type FinanceRow = {
  highlight?: boolean;
  label: string;
  strong?: boolean;
  value: number;
};

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];
const monthNumberByName: Record<string, number> = {
  agu: 8,
  agustus: 8,
  apr: 4,
  april: 4,
  des: 12,
  desember: 12,
  feb: 2,
  februari: 2,
  jan: 1,
  januari: 1,
  jul: 7,
  juli: 7,
  jun: 6,
  juni: 6,
  mar: 3,
  maret: 3,
  mei: 5,
  nov: 11,
  november: 11,
  okt: 10,
  oktober: 10,
  sep: 9,
  september: 9
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

function getMonthLabelFromDate(date: string) {
  const isoDate = date.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (isoDate) {
    return `${monthNames[Number(isoDate[2]) - 1]} ${isoDate[1]}`;
  }

  const parts = date.trim().split(/\s+/);
  const monthPart = parts.find((part) => monthNumberByName[part.toLowerCase()]);
  const monthNumber = monthPart
    ? monthNumberByName[monthPart.toLowerCase()]
    : 6;
  const year = parts.find((part) => /^\d{4}$/.test(part)) ?? "2026";

  return `${monthNames[monthNumber - 1]} ${year}`;
}

function getLatestMonth(transactions: TransactionWithDetails[]) {
  return transactions
    .map((transaction) => getMonthLabelFromDate(transaction.date))
    .sort((first, second) => {
      const [firstMonth, firstYear] = first.split(" ");
      const [secondMonth, secondYear] = second.split(" ");
      return (
        Number(firstYear) * 12 + monthNames.indexOf(firstMonth) -
        (Number(secondYear) * 12 + monthNames.indexOf(secondMonth))
      );
    })
    .at(-1) ?? `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;
}

function sumDetail(transaction: TransactionWithDetails, item: string) {
  return transaction.details
    .filter((detail) => detail.item === item)
    .reduce((sum, detail) => sum + detail.qty * detail.price, 0);
}

function financeCell(row?: FinanceRow) {
  if (!row) {
    return '<td class="label empty"></td><td class="amount empty"></td>';
  }

  return `<td class="label ${row.strong ? "strong" : ""}">${escapeHtml(
    row.label
  )}</td><td class="amount ${
    row.highlight ? "highlight" : row.strong ? "strong" : ""
  }">${row.value}</td>`;
}

function financeExcelResponse({
  costRows,
  kebabRows,
  kupatRows,
  neracaRows,
  period,
  totalRows
}: {
  costRows: FinanceRow[];
  kebabRows: FinanceRow[];
  kupatRows: FinanceRow[];
  neracaRows: FinanceRow[];
  period: string;
  totalRows: FinanceRow[];
}) {
  const firstSectionRows = Array.from({
    length: Math.max(kebabRows.length, kupatRows.length)
  })
    .map(
      (_, index) =>
        `<tr>${financeCell(kebabRows[index])}<td class="gap"></td>${financeCell(
          kupatRows[index]
        )}<td class="gap"></td><td class="empty" colspan="2"></td></tr>`
    )
    .join("");
  const secondSectionRows = Array.from({
    length: Math.max(totalRows.length, costRows.length, neracaRows.length)
  })
    .map(
      (_, index) =>
        `<tr>${financeCell(totalRows[index])}<td class="gap"></td>${financeCell(
          costRows[index]
        )}<td class="gap"></td>${financeCell(neracaRows[index])}</tr>`
    )
    .join("");
  const body = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; }
          table { border-collapse: collapse; }
          td { height: 22px; }
          .report-title { background: #facc15; font-size: 18px; font-weight: 800; padding: 10px; text-align: center; }
          .period { font-weight: 700; padding: 7px; text-align: center; }
          .section-title { background: #0f172a; color: #ffffff; font-weight: 800; padding: 7px; text-align: center; }
          .label { border: 1px solid #64748b; font-weight: 600; min-width: 220px; padding: 5px 8px; text-transform: uppercase; }
          .amount { border: 1px solid #64748b; min-width: 115px; padding: 5px 8px; text-align: right; mso-number-format: "#,##0"; }
          .highlight { background: #15803d; color: #ffffff; font-weight: 800; }
          .strong { background: #fde047; color: #0f172a; font-weight: 800; }
          .gap { border: 0; min-width: 28px; }
          .empty { border: 0; background: #ffffff; }
          .spacer td { height: 22px; }
        </style>
      </head>
      <body>
        <table>
          <tr><td class="report-title" colspan="8">NERACA KEUANGAN YUDHISTIRA F&amp;B</td></tr>
          <tr><td class="period" colspan="8">PERIODE ${escapeHtml(period)}</td></tr>
          <tr class="spacer"><td colspan="8"></td></tr>
          <tr>
            <td class="section-title" colspan="2">KEBAB</td><td class="gap"></td>
            <td class="section-title" colspan="2">KUPAT TAHU</td><td class="gap"></td>
            <td class="empty" colspan="2"></td>
          </tr>
          ${firstSectionRows}
          <tr class="spacer"><td colspan="8"></td></tr>
          <tr>
            <td class="section-title" colspan="2">TOTAL PENJUALAN</td><td class="gap"></td>
            <td class="section-title" colspan="2">BIAYA BIAYA</td><td class="gap"></td>
            <td class="section-title" colspan="2">NERACA</td>
          </tr>
          ${secondSectionRows}
        </table>
      </body>
    </html>`;
  const filename = `neraca-keuangan-${period
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.xls`;

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/vnd.ms-excel; charset=utf-8"
    }
  });
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
    const period = searchParams.get("month") ?? getLatestMonth(transactions);
    const monthTransactions = transactions.filter(
      (transaction) => getMonthLabelFromDate(transaction.date) === period
    );
    const sales = monthTransactions.filter(
      (transaction) => transaction.type === "Penjualan"
    );
    const kupatSales = monthTransactions.filter(
      (transaction) => transaction.type === "Kupat Tahu Penjualan"
    );
    const expenseTotal = monthTransactions
      .filter((transaction) => transaction.type === "Biaya Lain Lain")
      .reduce((sum, transaction) => sum + transaction.total, 0);
    const parameterDefinitions = await db.select().from(schema.monthlyParameters).all();
    const monthlyParameterValues = await db
      .select()
      .from(schema.monthlyParameterValues)
      .all();
    const parameters = parameterDefinitions.map((parameter) => ({
      ...parameter,
      amount:
        monthlyParameterValues.find(
          (value) =>
            value.parameterKey === parameter.key && value.month === period
        )?.amount ?? (parameter.type === "cost" ? parameter.amount : 0)
    }));
    const kebab = {
      gaji: sales.reduce((sum, item) => sum + sumDetail(item, "Gaji Karyawan"), 0),
      grab: sales.reduce((sum, item) => sum + sumDetail(item, "Grab/GoFood"), 0),
      modal: sales.reduce((sum, item) => sum + sumDetail(item, "Modal Penjualan"), 0),
      omset: sales.reduce((sum, item) => sum + item.total, 0),
      other: sales.reduce((sum, item) => sum + sumDetail(item, "Lain lain"), 0),
      qris: sales.reduce((sum, item) => sum + sumDetail(item, "QRIS"), 0)
    };
    const kupat = {
      cash: kupatSales.reduce((sum, item) => sum + sumDetail(item, "Cash Kupat Tahu"), 0),
      gaji: kupatSales.reduce((sum, item) => sum + sumDetail(item, "Gaji Kupat Tahu"), 0),
      modal: kupatSales.reduce((sum, item) => sum + sumDetail(item, "Modal Kupat Tahu"), 0),
      net: kupatSales.reduce(
        (sum, item) => sum + sumDetail(item, "Pendapatan Bersih Kupat Tahu"),
        0
      ),
      omset: kupatSales.reduce((sum, item) => sum + item.total, 0),
      other: kupatSales.reduce(
        (sum, item) => sum + sumDetail(item, "Lain lain Kupat Tahu"),
        0
      ),
      qris: kupatSales.reduce((sum, item) => sum + sumDetail(item, "QRIS Kupat Tahu"), 0)
    };
    const kebabCash =
      kebab.omset - kebab.grab - kebab.qris - kebab.gaji - kebab.other;
    const kebabNet = kebab.omset - kebab.modal - kebab.gaji - kebab.other;
    const kupatCash =
      kupat.cash || kupat.omset - kupat.gaji - kupat.qris - kupat.other;
    const total = {
      cash: kebabCash + kupatCash,
      gaji: kebab.gaji + kupat.gaji,
      grabQris: kebab.grab + kebab.qris + kupat.qris,
      modal: kebab.modal + kupat.modal,
      net: kebabNet + kupat.net,
      omset: kebab.omset + kupat.omset,
      other: kebab.other + kupat.other
    };
    const costParameters = parameters.filter((item) => item.type === "cost");
    const parameterCostTotal = costParameters.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const operationalCostTotal = parameterCostTotal + expenseTotal;
    const additionalIncome = parameters
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const yudhistiraNet = total.net - operationalCostTotal;
    const finalNet = yudhistiraNet + additionalIncome;
    const kebabRows: FinanceRow[] = [
      { label: "OMSET", value: kebab.omset },
      { label: "GRAB/QRIS", value: kebab.grab + kebab.qris },
      { label: "GAJI", value: kebab.gaji },
      { label: "LAIN LAIN", value: kebab.other },
      { label: "CASH", value: kebabCash },
      { highlight: true, label: "PENJUALAN BERSIH", value: kebabNet },
      { label: "MODAL TERJUAL", value: kebab.modal }
    ];
    const kupatRows: FinanceRow[] = [
      { label: "OMSET", value: kupat.omset },
      { label: "GRAB/QRIS", value: kupat.qris },
      { label: "GAJI", value: kupat.gaji },
      { label: "LAIN LAIN", value: kupat.other },
      { label: "CASH", value: kupatCash },
      { highlight: true, label: "PENJUALAN BERSIH", value: kupat.net },
      { label: "MODAL TERJUAL", value: kupat.modal }
    ];
    const totalRows: FinanceRow[] = [
      { label: "OMSET", value: total.omset },
      { label: "GRAB/QRIS", value: total.grabQris },
      { label: "GAJI", value: total.gaji },
      { label: "LAIN LAIN", value: total.other },
      { label: "CASH", value: total.cash },
      { highlight: true, label: "PENJUALAN BERSIH", value: total.net },
      { label: "MODAL TERJUAL", value: total.modal }
    ];
    const costRows: FinanceRow[] = [
      ...costParameters.map((item) => ({ label: item.name, value: item.amount })),
      ...(expenseTotal
        ? [{ label: "BIAYA LAIN LAIN TRANSAKSI", value: expenseTotal }]
        : []),
      { strong: true, label: "TOTAL BIAYA", value: operationalCostTotal }
    ];
    const neracaRows: FinanceRow[] = [
      { highlight: true, label: "LABA KOTOR", value: total.net },
      { label: "BIAYA - BIAYA", value: operationalCostTotal },
      { strong: true, label: "LABA BERSIH YUDHISTIRA", value: yudhistiraNet },
      { label: "BRILINK (PENDAPATAN TAMBAHAN)", value: additionalIncome },
      { highlight: true, strong: true, label: "LABA BERSIH", value: finalNet }
    ];

    return financeExcelResponse({
      costRows,
      kebabRows,
      kupatRows,
      neracaRows,
      period,
      totalRows
    });
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
