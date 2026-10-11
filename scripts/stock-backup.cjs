const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@libsql/client');
const root = path.resolve(__dirname, '..');
loadEnvConfig(root, true);
const client = createClient({ url: process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN });
const tables = ['locations', 'materials', 'stock_balances', 'transactions', 'transaction_details', 'stock_opnames',
  'daily_performance', 'monthly_parameters', 'monthly_parameter_values', 'savings_transactions'];
const encode = (value) => JSON.stringify(value, (_, item) => typeof item === 'bigint' ? Number(item) : item);
const hash = (value) => crypto.createHash('sha256').update(encode(value)).digest('hex');

async function snapshot() {
  const data = {};
  const transaction = await client.transaction('read');
  try {
    for (const table of tables) {
      const result = await transaction.execute(`SELECT * FROM "${table}" ORDER BY rowid`);
      data[table] = result.rows.map((row) => ({ ...row }));
    }
    await transaction.commit();
    return data;
  } catch (error) { await transaction.rollback(); throw error; }
}

async function main() {
  const current = await snapshot();
  if (process.argv[2] === '--verify') {
    const original = JSON.parse(fs.readFileSync(path.resolve(process.argv[3]), 'utf8')).tables;
    const result = {};
    for (const table of tables) {
      const key = { locations: 'key', materials: 'code', transactions: 'number', monthly_parameters: 'key' }[table] ?? 'id';
      const byKey = new Map(current[table].map((row) => [row[key], row]));
      const changed = original[table].filter((row) => !byKey.has(row[key]) || hash(row) !== hash(byKey.get(row[key])));
      result[table] = { originalRows: original[table].length, currentRows: current[table].length, changedOrMissingOldRows: changed.length };
    }
    console.log(encode(result));
    if (Object.values(result).some((row) => row.changedOrMissingOldRows > 0)) process.exitCode = 1;
  } else {
    const dir = path.join(root, 'data', 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const filename = path.join(dir, `stock-before-${Date.now()}.json`);
    fs.writeFileSync(filename, encode({ createdAt: new Date().toISOString(), tables: current }));
    console.log(encode({ backup: filename, sha256: hash(current), rows: Object.fromEntries(tables.map((table) => [table, current[table].length])) }));
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => client.close());
