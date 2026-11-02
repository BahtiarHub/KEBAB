const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

function load(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = (name) => name === './date' ? load('src/lib/date.ts') : original(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText, filename);
  return mod.exports;
}

const { getSavingsPeriodSummary } = load('src/lib/savings-summary.ts');
const categories = ['Tabungan', 'Uang Mamah', 'Uang Bapa', 'Persekot Kontrakan', 'Lainnya'];
const entry = (id, date, category, amount, direction = 'credit') => ({ id, date, category, amount, direction, note: `Transaksi ${id}` });
const rows = [
  entry(1, '31 Des 2025', 'Tabungan', 1000000),
  entry(2, '01 Okt 2026', 'Tabungan', 2000000),
  entry(4, '02 Nov 2026', 'Tabungan', 500000, 'debit'),
  entry(3, '01 Nov 2026', 'Tabungan', 4000000),
  entry(5, '01 Nov 2026', 'Uang Mamah', 750000),
  entry(6, '30 Nov 2026', 'Uang Mamah', 100000, 'debit'),
  entry(7, '01 Des 2026', 'Tabungan', 9000000),
  entry(8, '01 Jan 2027', 'Tabungan', 12000000)
];

test('monthly category balance carries earlier periods and excludes later months', () => {
  const result = getSavingsPeriodSummary(rows, categories, 2026, 10);
  const tabungan = result.categories.find((category) => category.category === 'Tabungan');
  assert.equal(tabungan.openingBalance, 3000000);
  assert.equal(tabungan.credit, 4000000);
  assert.equal(tabungan.debit, 500000);
  assert.equal(tabungan.balance, 6500000);
  assert.deepEqual(tabungan.transactions.map((row) => [row.id, row.balance]), [[3, 7000000], [4, 6500000]]);
  assert.equal(result.balance, 7150000);
});

test('annual filter includes the full year but keeps the previous year as opening only', () => {
  const result = getSavingsPeriodSummary(rows, categories, 2026, null);
  assert.equal(result.openingBalance, 1000000);
  assert.equal(result.transactions.length, 6);
  assert.equal(result.credit, 15750000);
  assert.equal(result.debit, 600000);
  assert.equal(result.balance, 16150000);
  assert.equal(result.categories.reduce((sum, category) => sum + category.balance, 0), result.balance);
});

test('empty categories and inactive months still show the correct carried balance', () => {
  const result = getSavingsPeriodSummary(rows, categories, 2026, 8);
  assert.equal(result.transactions.length, 0);
  assert.equal(result.balance, 1000000);
  const bapa = result.categories.find((category) => category.category === 'Uang Bapa');
  assert.equal(bapa.balance, 0);
  assert.deepEqual(bapa.transactions, []);
});

test('same-day rows are ordered by id and legacy categories remain visible', () => {
  const source = [entry(2, '01 Nov 2026', 'Belum Dikategorikan', 20000, 'debit'), entry(1, '2026-11-01', 'Belum Dikategorikan', 50000)];
  const before = JSON.stringify(source);
  const result = getSavingsPeriodSummary(source, categories, 2026, 10);
  const legacy = result.categories.find((category) => category.category === 'Belum Dikategorikan');
  assert.deepEqual(legacy.transactions.map((row) => [row.id, row.balance]), [[1, 50000], [2, 30000]]);
  assert.equal(JSON.stringify(source), before);
});

test('moving or deleting a transaction refreshes both category and overall totals', () => {
  const source = [entry(1, '01 Nov 2026', 'Tabungan', 50000), entry(2, '02 Nov 2026', 'Tabungan', 10000, 'debit')];
  const moved = getSavingsPeriodSummary(source.map((row) => row.id === 1 ? { ...row, category: 'Uang Bapa' } : row), categories, 2026, 10);
  assert.equal(moved.categories.find((category) => category.category === 'Tabungan').balance, -10000);
  assert.equal(moved.categories.find((category) => category.category === 'Uang Bapa').balance, 50000);
  assert.equal(moved.balance, 40000);
  const deleted = getSavingsPeriodSummary(source.filter((row) => row.id !== 2), categories, 2026, 10);
  assert.equal(deleted.balance, 50000);
});
