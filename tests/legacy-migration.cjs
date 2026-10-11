const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const crypto = require('node:crypto');
const ts = require('typescript');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', `legacy-test-${crypto.randomUUID()}.sqlite`);
process.env.TURSO_DATABASE_URL = `file:${file.replaceAll('\\', '/')}`;
process.env.DATABASE_URL = process.env.TURSO_DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;
delete process.env.DATABASE_AUTH_TOKEN;
const cache = new Map();
function load(source) {
  const filename = path.resolve(root, source);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  cache.set(filename, mod);
  const normalRequire = mod.require.bind(mod);
  mod.require = (name) => {
    if (name.startsWith('.')) { const target = path.resolve(path.dirname(filename), name); if (fs.existsSync(`${target}.ts`)) return load(`${target}.ts`); }
    return normalRequire(name);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
  return mod.exports;
}
const tables = ['locations', 'materials', 'stock_balances', 'transactions', 'transaction_details', 'stock_opnames', 'daily_performance', 'monthly_parameters', 'monthly_parameter_values', 'savings_transactions'];
let first, second;
async function snapshot(client) {
  const data = {};
  for (const table of tables) data[table] = (await client.execute(`SELECT * FROM "${table}" ORDER BY rowid`)).rows.map((row) => ({ ...row }));
  return data;
}
async function main() {
  first = load('src/db/index.ts');
  await first.ensureDatabase();
  if (process.argv[2]) {
    const original = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8')).tables;
    const statements = [...tables].reverse().map((table) => `DELETE FROM "${table}"`);
    for (const table of tables) for (const row of original[table]) {
      const columns = Object.keys(row);
      statements.push({ sql: `INSERT INTO "${table}" (${columns.map((key) => `"${key}"`).join(',')}) VALUES (${columns.map(() => '?').join(',')})`, args: columns.map((key) => row[key]) });
    }
    await first.libsql.batch(statements, 'write');
  }
  const before = await snapshot(first.libsql);
  await first.libsql.executeMultiple('DROP TABLE stock_requests; DROP TABLE stock_movements; DROP TABLE stock_baselines;');
  first.libsql.close();
  cache.delete(path.resolve(root, 'src/db/index.ts'));
  second = load('src/db/index.ts');
  await second.ensureDatabase();
  const after = await snapshot(second.libsql);
  assert.deepEqual(after, before, 'Old business rows must remain byte-for-byte equal after migration');
  for (const table of ['stock_requests', 'stock_movements', 'stock_baselines']) assert.equal(Number((await second.libsql.execute(`SELECT COUNT(*) AS n FROM "${table}"`)).rows[0].n), 0);
  console.log(JSON.stringify({ migration: 'PASS', unchangedRows: Object.fromEntries(tables.map((table) => [table, before[table].length])), sha256: crypto.createHash('sha256').update(JSON.stringify(after)).digest('hex') }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => {
  if (second) second.libsql.close();
  for (const suffix of ['', '-wal', '-shm']) try { fs.rmSync(file + suffix, { force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
});
