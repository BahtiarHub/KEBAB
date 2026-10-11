import { createHash, randomUUID } from "node:crypto";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { ApiError, requireUser } from "@/lib/api-access";
import { formatDateForReport, getBusinessDate, parseReportDate } from "@/lib/date";
import type { StockTransaction } from "@/lib/stock-history";

export type StockActor = Awaited<ReturnType<typeof requireUser>>;
export type StockSource = typeof schema.stockMovements.$inferInsert.source;
export type StockItem = { code: string; name?: string; qty: number; price?: number; buy?: number; sell?: number | null };
export type StockChange = { materialCode: string; locationKey: string; delta?: number; physical?: number; expected?: number; note: string };

export function integer(value: unknown, label: string, minimum = 0): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new ApiError(`${label} harus berupa angka bulat minimal ${minimum}.`);
  return value;
}

export function items(value: unknown): StockItem[] {
  if (!Array.isArray(value) || !value.length || value.length > 100) throw new ApiError("Pilih bahan baku yang akan diproses.");
  const seen = new Set<string>();
  return value.map((entry) => {
    if (!entry || typeof entry.code !== "string" || seen.has(entry.code)) throw new ApiError("Kode bahan baku tidak valid atau duplikat.");
    seen.add(entry.code);
    integer(entry.qty, "Jumlah bahan baku");
    return entry as StockItem;
  });
}

export async function resolveItems(tx: StockTransaction, input: StockItem[]) {
  const master = await tx.select().from(schema.materials).where(inArray(schema.materials.code, input.map((item) => item.code))).all();
  return input.map((item) => {
    const material = master.find((row) => row.code === item.code);
    if (!material || (item.name !== undefined && item.name !== material.name)) throw new ApiError(`Bahan baku ${item.code} tidak cocok dengan master data.`);
    return { ...item, material };
  });
}

export async function resolveLocation(tx: StockTransaction, key: unknown, name: unknown, kioskOnly = false) {
  if (typeof key !== "string") throw new ApiError("Pilih lokasi transaksi.");
  const location = await tx.select().from(schema.locations).where(eq(schema.locations.key, key)).get();
  if (!location || (kioskOnly && location.type !== "Kios") || (name !== undefined && name !== location.name)) throw new ApiError("Lokasi transaksi tidak cocok dengan master data.");
  return location;
}

export async function writeStock(tx: StockTransaction, actor: StockActor, number: string, date: string, source: StockSource, changes: StockChange[]) {
  if (!changes.length) throw new ApiError("Tidak ada bahan baku yang diproses.");
  const codes = [...new Set(changes.map((row) => row.materialCode))];
  const keys = [...new Set(changes.map((row) => row.locationKey))];
  const master = await tx.select().from(schema.materials).where(inArray(schema.materials.code, codes)).all();
  const locations = await tx.select().from(schema.locations).where(inArray(schema.locations.key, keys)).all();
  const balances = await tx.select().from(schema.stockBalances).where(and(inArray(schema.stockBalances.materialCode, codes), inArray(schema.stockBalances.locationKey, keys))).all();
  const journals = await tx.select().from(schema.stockMovements).where(and(inArray(schema.stockMovements.materialCode, codes), inArray(schema.stockMovements.locationKey, keys))).all();
  const oldDetails = await tx.select({ item: schema.transactionDetails.item, date: schema.transactions.date, type: schema.transactions.type, location: schema.transactions.location })
    .from(schema.transactionDetails).innerJoin(schema.transactions, eq(schema.transactions.number, schema.transactionDetails.transactionNumber))
    .where(and(inArray(schema.transactionDetails.item, master.map((row) => row.name)), inArray(schema.transactions.type, ["Belanja", "Distribusi", "Penjualan"]))).all();
  const oldOpnames = await tx.select().from(schema.stockOpnames).where(and(inArray(schema.stockOpnames.material, master.map((row) => row.name)), inArray(schema.stockOpnames.location, locations.map((row) => row.name)))).all();
  const day = parseReportDate(date)!.getTime();
  const recordedAt = Date.now();
  const updates = changes.map((change) => {
    const material = master.find((row) => row.code === change.materialCode);
    const location = locations.find((row) => row.key === change.locationKey);
    const balance = balances.find((row) => row.materialCode === change.materialCode && row.locationKey === change.locationKey);
    if (!material || !location || !balance) throw new ApiError("Saldo bahan baku tidak ditemukan. Hubungi Admin.", 409);
    const dates = [
      ...journals.filter((row) => row.materialCode === material.code && row.locationKey === location.key).map((row) => row.date),
      ...oldOpnames.filter((row) => row.material === material.name && row.location === location.name).map((row) => row.date),
      ...oldDetails.filter((row) => row.item === material.name && (location.key === "gudang" ? row.type === "Belanja" || row.type === "Distribusi" : row.location === location.name && (row.type === "Distribusi" || row.type === "Penjualan"))).map((row) => row.date)
    ].flatMap((value) => { const parsed = parseReportDate(value); return parsed ? [parsed.getTime()] : []; });
    const latest = dates.length ? Math.max(...dates) : null;
    if (latest !== null && day < latest) throw new ApiError(`${material.name} di ${location.name} sudah memiliki aktivitas pada ${formatDateForReport(new Date(latest).toISOString().slice(0, 10))}. Pilih tanggal tersebut atau sesudahnya.`, 409);
    if (change.expected !== undefined && change.expected !== balance.qty) throw new ApiError(`Stok ${material.name} di ${location.name} sudah berubah. Muat ulang data sebelum opname.`, 409);
    const after = change.physical ?? balance.qty + (change.delta ?? 0);
    if (change.physical === undefined && balance.qty + (change.delta ?? 0) < 0) throw new ApiError(`Stok ${material.name} di ${location.name} tidak cukup. Tersedia ${balance.qty}.`, 409);
    integer(after, `Stok akhir ${material.name} di ${location.name}`);
    return { ...change, id: balance.id, before: balance.qty, after, delta: after - balance.qty, lastDate: latest === null ? null : new Date(latest).toISOString().slice(0, 10) };
  });
  if (new Set(updates.map((row) => row.id)).size !== updates.length) throw new ApiError("Perubahan stok duplikat.");
  await tx.insert(schema.stockBaselines).values(updates.map((row) => ({ key: `${row.locationKey}:${row.materialCode}`, locationKey: row.locationKey,
    materialCode: row.materialCode, qty: row.before, lastLegacyDate: row.lastDate, recordedAt }))).onConflictDoNothing().run();
  const updated = await tx.update(schema.stockBalances).set({ qty: sql`case ${schema.stockBalances.id} ${sql.join(updates.map((row) => sql`when ${row.id} then ${row.after}`), sql` `)} else ${schema.stockBalances.qty} end` })
    .where(or(...updates.map((row) => and(eq(schema.stockBalances.id, row.id), eq(schema.stockBalances.qty, row.before)))))
    .returning({ id: schema.stockBalances.id });
  if (updated.length !== updates.length) throw new ApiError("Saldo berubah selama penyimpanan. Silakan coba kembali.", 409);
  await tx.insert(schema.stockMovements).values(updates.map((row) => ({ number, date, source, locationKey: row.locationKey, materialCode: row.materialCode,
    beforeQty: row.before, afterQty: row.after, delta: row.delta, userId: actor.id, note: row.note, recordedAt }))).run();
  return updates;
}

export function apiFailure(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  console.error("Stock API failed", error);
  return NextResponse.json({ error: "Penyimpanan belum dapat dikonfirmasi. Coba kembali dengan data yang sama." }, { status: 500 });
}

export async function stockPost(request: Request, source: StockSource,
  save: (tx: StockTransaction, body: Record<string, unknown>, actor: StockActor, number: string, date: string) => Promise<void>, adminOnly = false) {
  try {
    const actor = await requireUser(request, adminOnly);
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("Format data tidak valid.");
    const key = request.headers.get("Idempotency-Key") ?? body.requestId;
    if (typeof key !== "string" || !/^[a-zA-Z0-9_-]{16,100}$/.test(key)) throw new ApiError("Identitas transaksi tidak valid. Muat ulang halaman.");
    if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !parseReportDate(body.date) || body.date > getBusinessDate()) throw new ApiError("Pilih tanggal transaksi yang valid, maksimal hari ini.");
    const date = formatDateForReport(body.date);
    const fingerprint = createHash("sha256").update(JSON.stringify([source, actor.id, body])).digest("hex");
    const prefix = { Belanja: "BLJ", Distribusi: "DST", Penjualan: "PNJ", Opname: "OPN" }[source];
    const number = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const result = await db.transaction(async (tx) => {
          // Claim the request first to acquire the write lock before reading balances.
          const claimed = await tx.insert(schema.stockRequests).values({ key, userId: actor.id, fingerprint, number, createdAt: Date.now() }).onConflictDoNothing().returning();
          if (!claimed.length) {
            const previous = await tx.select().from(schema.stockRequests).where(eq(schema.stockRequests.key, key)).get();
            if (!previous || previous.fingerprint !== fingerprint || previous.userId !== actor.id) throw new ApiError("Identitas transaksi sudah digunakan untuk data berbeda.", 409);
            return { ok: true, number: previous.number, replayed: true };
          }
          await save(tx, body, actor, number, date);
          return { ok: true, number, replayed: false };
        });
        return NextResponse.json(result);
      } catch (error) {
        const description = String(error instanceof Error ? error.message + String(error.cause ?? "") : error);
        if (attempt < 4 && /SQLITE_BUSY|SQLITE_LOCKED|TRANSACTION_CONFLICT|database is locked/i.test(description)) {
          await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
        } else throw error;
      }
    }
    throw new Error("Transaction retries exhausted");
  } catch (error) { return apiFailure(error); }
}
