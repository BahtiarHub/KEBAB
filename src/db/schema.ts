import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").$type<"Admin" | "Operator">().notNull().default("Operator"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
});

export const locations = sqliteTable("locations", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  address: text("address").notNull()
});

export const materials = sqliteTable("materials", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  buy: integer("buy").notNull(),
  sell: integer("sell"),
  minGudang: integer("min_gudang"),
  minWadas: integer("min_wadas"),
  minCiherang: integer("min_ciherang"),
  minBubulak: integer("min_bubulak")
});

export const stockBalances = sqliteTable(
  "stock_balances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    materialCode: text("material_code")
      .notNull()
      .references(() => materials.code, { onDelete: "cascade" }),
    locationKey: text("location_key")
      .notNull()
      .references(() => locations.key, { onDelete: "cascade" }),
    qty: integer("qty").notNull().default(0)
  },
  (table) => ({
    materialLocation: uniqueIndex("stock_material_location_idx").on(
      table.materialCode,
      table.locationKey
    )
  })
);

export const monthlyParameters = sqliteTable("monthly_parameters", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  type: text("type").$type<"cost" | "income">().notNull(),
  amount: integer("amount").notNull(),
  note: text("note")
});

export const dailyPerformance = sqliteTable("daily_performance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  kiosk: text("kiosk").notNull(),
  omset: integer("omset").notNull(),
  laba: integer("laba").notNull()
});

export const transactions = sqliteTable("transactions", {
  number: text("number").primaryKey(),
  date: text("date").notNull(),
  type: text("type")
    .$type<"Penjualan" | "Belanja" | "Distribusi" | "Biaya Lain Lain">()
    .notNull(),
  location: text("location").notNull(),
  note: text("note").notNull(),
  total: integer("total").notNull().default(0)
});

export const transactionDetails = sqliteTable("transaction_details", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  transactionNumber: text("transaction_number")
    .notNull()
    .references(() => transactions.number, { onDelete: "cascade" }),
  item: text("item").notNull(),
  qty: real("qty").notNull(),
  price: integer("price").notNull().default(0),
  activity: text("activity").notNull()
});

export const stockOpnames = sqliteTable("stock_opnames", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  number: text("number").notNull(),
  location: text("location").notNull(),
  material: text("material").notNull(),
  systemStock: integer("system_stock").notNull(),
  physicalStock: integer("physical_stock").notNull(),
  difference: integer("difference").notNull(),
  officer: text("officer").notNull()
});

export type MaterialRow = typeof materials.$inferSelect;
export type StockBalanceRow = typeof stockBalances.$inferSelect;
