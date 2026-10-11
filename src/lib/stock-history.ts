import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { parseReportDate } from "@/lib/date";

export type StockTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type HistoryRow = {
  date: string; dateValue: number; order: number; number: string;
  source: "Belanja" | "Distribusi" | "Penjualan" | "Opname";
  delta: number; note: string; physical?: number; system?: number; reliable: boolean; sequence?: number;
};

export function transactionOrder(number: string) {
  const match = number.match(/-(\d{12,})(?:-|$)/);
  return match ? Number(match[1]) : 0;
}

export async function stockHistory(conn: StockTransaction | typeof db, materialCode: string, locationKey: string) {
  const material = await conn.select().from(schema.materials).where(eq(schema.materials.code, materialCode)).get();
  const location = await conn.select().from(schema.locations).where(eq(schema.locations.key, locationKey)).get();
  if (!material || !location) return null;
  const ledger = await conn.select().from(schema.stockMovements)
    .where(and(eq(schema.stockMovements.materialCode, materialCode), eq(schema.stockMovements.locationKey, locationKey))).all();
  const headers = await conn.select().from(schema.transactions)
    .where(locationKey === "gudang"
      ? inArray(schema.transactions.type, ["Belanja", "Distribusi"])
      : and(eq(schema.transactions.location, location.name), inArray(schema.transactions.type, ["Distribusi", "Penjualan"]))).all();
  const details = headers.length ? await conn.select().from(schema.transactionDetails)
    .where(and(inArray(schema.transactionDetails.transactionNumber, headers.map((row) => row.number)), eq(schema.transactionDetails.item, material.name))).all() : [];
  const opnames = await conn.select().from(schema.stockOpnames)
    .where(and(eq(schema.stockOpnames.location, location.name), eq(schema.stockOpnames.material, material.name))).all();
  const journalNumbers = new Set(ledger.map((row) => row.number));
  const legacy: HistoryRow[] = [];
  for (const header of headers) {
    if (journalNumbers.has(header.number)) continue;
    const parsed = parseReportDate(header.date);
    if (!parsed) continue;
    const qty = details.filter((row) => row.transactionNumber === header.number).reduce((sum, row) => sum + row.qty, 0);
    if (qty <= 0) continue;
    legacy.push({ date: header.date, dateValue: parsed.getTime(), order: transactionOrder(header.number), number: header.number,
      source: header.type as HistoryRow["source"], delta: header.type === "Penjualan" || (locationKey === "gudang" && header.type === "Distribusi") ? -qty : qty,
      note: header.type === "Penjualan" ? "Penjualan" : locationKey === "gudang" ? header.type : "Distribusi masuk dari Gudang Utama", reliable: false });
  }
  for (const row of opnames) {
    if (journalNumbers.has(row.number)) continue;
    const parsed = parseReportDate(row.date);
    if (!parsed) continue;
    legacy.push({ date: row.date, dateValue: parsed.getTime(), order: transactionOrder(row.number), number: row.number, source: "Opname",
      delta: row.difference, physical: row.physicalStock, system: row.systemStock, note: `Opname fisik ${row.physicalStock}`, reliable: false });
  }
  const warnings = new Set<string>();
  let known: number | null = null;
  let latestEffectiveDate = 0;
  legacy.sort((a, b) => a.order - b.order || a.dateValue - b.dateValue);
  for (const event of legacy) {
    if (event.dateValue < latestEffectiveDate) warnings.add("Histori lama berisi transaksi bertanggal mundur; saldo per tanggal perlu rekonsiliasi.");
    latestEffectiveDate = Math.max(latestEffectiveDate, event.dateValue);
    if (event.source === "Opname") {
      if (known !== null && known !== event.system) warnings.add("Stok sistem pada opname lama berbeda dari histori sebelumnya.");
      event.delta = event.physical! - (known ?? event.system!);
      known = event.physical!;
    } else if (known !== null) {
      const next: number = known + event.delta;
      if (next < 0 && event.source === "Penjualan") {
        event.note = `Penjualan tercatat ${-event.delta}; pengurangan stok lama hanya ${known}. Perlu rekonsiliasi.`;
        warnings.add("Penjualan lama melebihi stok; jumlah tercatat dan pengurangan stok berbeda.");
        event.delta = -known;
        known = 0;
      } else {
        known = next;
        if (next < 0) warnings.add("Distribusi lama menghasilkan stok minus.");
      }
    }
  }
  const baseline = await conn.select().from(schema.stockBaselines).where(eq(schema.stockBaselines.key, `${locationKey}:${materialCode}`)).get();
  const current = await conn.select().from(schema.stockBalances)
    .where(and(eq(schema.stockBalances.materialCode, materialCode), eq(schema.stockBalances.locationKey, locationKey))).get();
  const anchorQty = baseline?.qty ?? current?.qty ?? 0;
  if (known !== null && known !== anchorQty) warnings.add("Saldo akhir histori lama berbeda dari saldo tersimpan; diperlukan rekonsiliasi.");
  const rows = [...legacy, ...ledger.map((row): HistoryRow => ({ date: row.date, dateValue: parseReportDate(row.date)!.getTime(), order: row.recordedAt,
    number: row.number, source: row.source, delta: row.delta, note: row.note, physical: row.source === "Opname" ? row.afterQty : undefined,
    system: row.source === "Opname" ? row.beforeQty : undefined, reliable: true, sequence: row.id }))].sort((a, b) =>
      a.dateValue - b.dateValue || (a.reliable && b.reliable ? a.sequence! - b.sequence! : a.reliable !== b.reliable ? Number(a.reliable) - Number(b.reliable) : a.order - b.order));
  return { material, location, rows, warnings: [...warnings], baseline, currentStock: current?.qty ?? 0,
    lastDate: rows.length ? new Date(Math.max(...rows.map((row) => row.dateValue))).toISOString().slice(0, 10) : null };
}
