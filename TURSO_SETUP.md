# Turso Production Database Setup

App ini sudah mendukung Turso/libSQL untuk production dan tetap memakai SQLite file lokal saat development.

## Environment Production

Isi env berikut di server/deployment:

```env
TURSO_DATABASE_URL=libsql://nama-database-nama-org.turso.io
TURSO_AUTH_TOKEN=token-dari-turso
BETTER_AUTH_URL=https://domain-production-anda
BETTER_AUTH_SECRET=secret-production-yang-panjang
```

Jika `TURSO_DATABASE_URL` tidak diisi, app otomatis fallback ke:

```env
file:data/kebab.sqlite
```

## Buat Database Turso

Gunakan Turso CLI di mesin yang sudah login:

```bash
turso db create kebab-production
turso db show kebab-production
turso db tokens create kebab-production
```

Masukkan URL dari `turso db show` ke `TURSO_DATABASE_URL`.
Masukkan token dari `turso db tokens create` ke `TURSO_AUTH_TOKEN`.

## Schema dan Seed

Saat app pertama kali berjalan dengan env Turso, app akan:

1. Membuat tabel jika belum ada.
2. Mengisi seed awal bahan baku, lokasi, parameter, transaksi contoh, dan stok awal jika data lokasi masih kosong.
3. Membuat user default melalui Better Auth:
   - Admin: `admin@yudhistira.local` / `admin123`
   - Operator: `operator@yudhistira.local` / `operator123`

## Drizzle

Untuk push schema manual:

```bash
npm run db:push
```

`drizzle.config.ts` otomatis memakai dialect `turso` jika `TURSO_DATABASE_URL` tersedia.
