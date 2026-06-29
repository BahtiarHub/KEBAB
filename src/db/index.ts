import fs from "node:fs";
import path from "node:path";

import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const dbDir = path.join(process.cwd(), "data");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const databaseUrl =
  process.env.TURSO_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:data/kebab.sqlite";

const authToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

export const libsql = createClient({
  authToken,
  url: databaseUrl
});

export const db = drizzle(libsql, { schema });

async function createTables() {
  await libsql.executeMultiple(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'Operator',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      password TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS locations (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS materials (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      buy INTEGER NOT NULL,
      sell INTEGER,
      min_gudang INTEGER,
      min_wadas INTEGER,
      min_ciherang INTEGER,
      min_bubulak INTEGER
    );

    CREATE TABLE IF NOT EXISTS stock_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_code TEXT NOT NULL REFERENCES materials(code) ON DELETE CASCADE,
      location_key TEXT NOT NULL REFERENCES locations(key) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 0,
      UNIQUE(material_code, location_key)
    );

    CREATE TABLE IF NOT EXISTS monthly_parameters (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      kiosk TEXT NOT NULL,
      omset INTEGER NOT NULL,
      laba INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      number TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      note TEXT NOT NULL,
      total INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transaction_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_number TEXT NOT NULL REFERENCES transactions(number) ON DELETE CASCADE,
      item TEXT NOT NULL,
      qty REAL NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      activity TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_opnames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      number TEXT NOT NULL,
      location TEXT NOT NULL,
      material TEXT NOT NULL,
      system_stock INTEGER NOT NULL,
      physical_stock INTEGER NOT NULL,
      difference INTEGER NOT NULL,
      officer TEXT NOT NULL
    );
  `);
}

const locationSeed = [
  { key: "gudang", name: "Gudang Utama", type: "Gudang", address: "Tempat pembelian dan penyimpanan awal" },
  { key: "wadas", name: "Kios Wadas", type: "Kios", address: "Bunderan Wadas" },
  { key: "ciherang", name: "Kios Ciherang", type: "Kios", address: "Jalan Ciherang" },
  { key: "bubulak", name: "Kios Bubulak", type: "Kios", address: "Dusun Bubulak" }
] as const;

const materialSeed = [
  ["BB-001", "TORTILLA BESAR", 1450, 15000, 80, 60, 10, 10, [128, 48, 8, 15]],
  ["BB-002", "TORTILLA SEDANG", 1350, 12000, 60, 40, 10, 10, [72, 44, 14, 9]],
  ["BB-003", "ROTI BURGER", 1750, 10000, 25, 15, 5, 5, [36, 12, 5, 0]],
  ["BB-004", "MOZZARELLA", 4250, 5000, 12, 8, 2, 2, [14, 7, 2, 3]],
  ["BB-005", "CHICKEN BULAT", 2500, 5000, 25, 15, 5, 5, [31, 18, 4, 7]],
  ["BB-006", "TELOR", 2500, 4000, 14, 10, 2, 2, [18, 9, 3, 2]],
  ["BB-007", "KEJU", 1500, 3000, 15, 5, 5, 5, [16, 6, 5, 4]],
  ["BB-008", "SOSIS", 1500, 3000, 30, 20, 5, 5, [42, 21, 4, 8]],
  ["BB-009", "PATTIES BURGER", 3800, null, 20, 10, 5, 5, [28, 12, 5, 6]],
  ["BB-010", "LETTUCE", 13000, null, 14, 10, 2, 2, [16, 9, 2, 3]],
  ["BB-011", "MAYONESE", 25000, null, 5, 3, 1, 1, [7, 3, 1, 1]],
  ["BB-012", "SAOS CABE", 16000, null, 4, 2, 1, 1, [6, 2, 1, 1]],
  ["BB-013", "SAOS TOMAT", 16000, null, 4, 2, 1, 1, [6, 2, 1, 1]],
  ["BB-014", "PLASTIK KEBAB", 5000, null, 3, 1, 1, 1, [5, 1, 1, 1]],
  ["BB-015", "PLASTIK BURGER", 10000, null, 3, 1, 1, 1, [5, 1, 1, 1]],
  ["BB-016", "CUTTER", 10000, null, 3, 1, 1, 1, [4, 1, 1, 1]],
  ["BB-017", "TISSUE", 7500, null, 3, 1, 1, 1, [4, 1, 1, 1]],
  ["BB-018", "MINYAK SAYUR", 34000, null, 3, 1, 1, 1, [4, 1, 1, 1]],
  ["BB-019", "GAS", 20000, null, 5, 3, 1, 1, [6, 3, 1, 1]],
  ["BB-020", "DAGING KEBAB", 140000, null, 5, 3, 1, 1, [7, 3, 1, 1]],
  ["BB-021", "PACK KEBAB", 660, null, 140, 100, 20, 20, [210, 88, 18, 27]],
  ["BB-022", "PACK BURGER", 540, null, 25, 15, 5, 5, [34, 13, 5, 4]],
  ["BB-023", "PLATIK BESAR", 10000, null, 3, 1, 1, 1, [4, 1, 1, 1]],
  ["BB-024", "KERTAS KEBAB", 57000, null, null, null, null, null, [3, 1, 1, 1]],
  ["BB-025", "MENTEGA", 250000, null, null, null, null, null, [2, 1, 0, 0]],
  ["BB-026", "SARUNG TANGAN", 7000, null, null, null, null, null, [4, 1, 1, 1]]
] as const;

const dailySeed = [
  ["22 Jun", "Kios Wadas", 545000, 238000],
  ["22 Jun", "Kios Ciherang", 318000, 126000],
  ["22 Jun", "Kios Bubulak", 244000, 96000],
  ["23 Jun", "Kios Wadas", 590000, 261000],
  ["23 Jun", "Kios Ciherang", 336000, 141000],
  ["23 Jun", "Kios Bubulak", 258000, 108000],
  ["24 Jun", "Kios Wadas", 612000, 278000],
  ["24 Jun", "Kios Ciherang", 352000, 149000],
  ["24 Jun", "Kios Bubulak", 276000, 114000],
  ["25 Jun", "Kios Wadas", 575000, 252000],
  ["25 Jun", "Kios Ciherang", 341000, 136000],
  ["25 Jun", "Kios Bubulak", 263000, 104000],
  ["26 Jun", "Kios Wadas", 628000, 286000],
  ["26 Jun", "Kios Ciherang", 375000, 158000],
  ["26 Jun", "Kios Bubulak", 298000, 122000],
  ["27 Jun", "Kios Wadas", 665000, 241000],
  ["27 Jun", "Kios Ciherang", 364000, 69000],
  ["27 Jun", "Kios Bubulak", 298000, 60000],
  ["28 Jun", "Kios Wadas", 720000, 274000],
  ["28 Jun", "Kios Ciherang", 438000, 118000],
  ["28 Jun", "Kios Bubulak", 315000, 61000]
] as const;

const parameterSeed = [
  ["sewa_wadas", "SEWA KIOS WADAS", "cost", 600000, "Pengurang laba bulanan"],
  ["sewa_bubulak", "SEWA KIOS BUBULAK", "cost", 550000, "Pengurang laba bulanan"],
  ["kontrakan_mj", "KONTRAKAN MJ", "cost", 1500000, "Pengurang laba bulanan"],
  ["sewa_guro", "SEWA KIOS GURO", "cost", 600000, "Pengurang laba bulanan"],
  ["listrik_mj", "LISTRIK KONTRAKAN MJ", "cost", 250000, "Pengurang laba bulanan"],
  ["air_mj", "AIR KONTRAKAN MJ", "cost", 58000, "Pengurang laba bulanan"],
  ["iuran_mj", "IURAN BULANAN MJ", "cost", 100000, "Pengurang laba bulanan"],
  ["beras", "BERAS", "cost", 200000, "Pengurang laba bulanan"],
  ["pajak", "PAJAK", "cost", 250000, "Pengurang laba bulanan"],
  ["biaya_lain_lain", "BIAYA LAIN LAIN", "cost", 180000, "Total kumulatif biaya lain lain dalam sebulan"],
  ["brilink", "PENDAPATAN USAHA LAIN (BRILINK)", "income", 1000000, "Diinput manual sebagai penambah laba bersih"]
] as const;

const transactionSeed = [
  ["BLJ-001", "28 Jun", "Belanja", "Gudang Utama", "Belanja TORTILLA BESAR dan Roti Burger", 357500],
  ["BLJ-002", "27 Jun", "Belanja", "Gudang Utama", "Belanja Daging Kebab", 280000],
  ["DST-001", "28 Jun", "Distribusi", "Kios Wadas", "Distribusi bahan dari Gudang Utama", 0],
  ["DST-002", "27 Jun", "Distribusi", "Kios Ciherang", "Distribusi roti burger dan pack", 0],
  ["BYA-001", "28 Jun", "Biaya Lain Lain", "Umum", "Bensin operasional", 30000],
  ["BYA-002", "27 Jun", "Biaya Lain Lain", "Gudang Utama", "Ongkos kirim belanja", 15000]
] as const;

const transactionDetailSeed = [
  ["BLJ-001", "TORTILLA BESAR", 100, 1450, "Stok gudang bertambah"],
  ["BLJ-001", "ROTI BURGER", 100, 1750, "Stok gudang bertambah"],
  ["BLJ-001", "Ongkir", 1, 37500, "Tercatat sebagai biaya belanja"],
  ["BLJ-002", "DAGING KEBAB", 2, 140000, "Stok gudang bertambah"],
  ["DST-001", "TORTILLA BESAR", 40, 0, "Gudang berkurang, kios bertambah"],
  ["DST-001", "PACK KEBAB", 40, 0, "Gudang berkurang, kios bertambah"],
  ["DST-002", "ROTI BURGER", 20, 0, "Gudang berkurang, kios bertambah"],
  ["DST-002", "PACK BURGER", 20, 0, "Gudang berkurang, kios bertambah"],
  ["BYA-001", "Bensin", 1, 30000, "Pengurang laba bulanan"],
  ["BYA-002", "Ongkos Kirim", 1, 15000, "Pengurang laba bulanan"]
] as const;

async function seedAppData() {
  const hasLocations = (await db.select().from(schema.locations).limit(1).all()).length > 0;
  if (hasLocations) {
    return;
  }

  await db.insert(schema.locations).values([...locationSeed]).run();

  await db.insert(schema.materials)
    .values(
      materialSeed.map(([code, name, buy, sell, minGudang, minWadas, minCiherang, minBubulak]) => ({
        code,
        name,
        buy,
        sell,
        minGudang,
        minWadas,
        minCiherang,
        minBubulak
      }))
    )
    .run();

  const locationKeys = ["gudang", "wadas", "ciherang", "bubulak"] as const;
  await db.insert(schema.stockBalances)
    .values(
      materialSeed.flatMap(([code, , , , , , , , stock]) =>
        locationKeys.map((locationKey, index) => ({
          locationKey,
          materialCode: code,
          qty: stock[index]
        }))
      )
    )
    .run();

  await db.insert(schema.monthlyParameters)
    .values(
      parameterSeed.map(([key, name, type, amount, note]) => ({
        key,
        name,
        type,
        amount,
        note
      }))
    )
    .run();

  await db.insert(schema.dailyPerformance)
    .values(
      dailySeed.map(([date, kiosk, omset, laba]) => ({
        date,
        kiosk,
        omset,
        laba
      }))
    )
    .run();

  await db.insert(schema.transactions)
    .values(
      transactionSeed.map(([number, date, type, location, note, total]) => ({
        date,
        location,
        note,
        number,
        total,
        type
      }))
    )
    .run();

  await db.insert(schema.transactionDetails)
    .values(
      transactionDetailSeed.map(([transactionNumber, item, qty, price, activity]) => ({
        activity,
        item,
        price,
        qty,
        transactionNumber
      }))
    )
    .run();
}

let prepared: Promise<void> | null = null;

export function ensureDatabase() {
  prepared ??= createTables().then(seedAppData);
  return prepared;
}

export async function updateMaterialBuyPrice(code: string, buy: number) {
  await ensureDatabase();
  return db
    .update(schema.materials)
    .set({ buy })
    .where(eq(schema.materials.code, code))
    .run();
}
