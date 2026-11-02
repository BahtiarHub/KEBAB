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
const { getAnnualFinance, getAnnualFinanceYears } = load('src/lib/annual-finance.ts');
const detail = (item, price, qty = 1) => ({ item, price, qty });
const report = (date, type, total, details = []) => ({ date, type, total, details });

test('combines Kebab and Kupat Tahu by month without treating QRIS or Grab as expenses', () => {
  const reports = [
    report('01 Nov 2026', 'Penjualan', 150000, [detail('Modal Penjualan', 30000), detail('Gaji Karyawan', 20000), detail('Lain lain', 5000), detail('QRIS', 10000), detail('Grab/GoFood', 30000)]),
    report('02 Nov 2026', 'Penjualan', 100000, [detail('Modal Penjualan', 20000), detail('Gaji Karyawan', 15000)]),
    report('02 Nov 2026', 'Kupat Tahu Penjualan', 100000, [detail('Modal Kupat Tahu', 60000), detail('Gaji Kupat Tahu', 10000), detail('Lain lain Kupat Tahu', 2000), detail('QRIS Kupat Tahu', 20000)])
  ];
  const result = getAnnualFinance(reports, [], [], 2026);
  assert.equal(result.rows.length, 12);
  assert.deepEqual(result.totals, { omset: 350000, salary: 45000, grossIncome: 240000, costs: 7000 });
  assert.equal(result.rows[10].omset, 350000);
  assert.equal(result.rows[9].hasActivity, false);
});

test('costs include saved monthly parameters, sales costs, and shipping once', () => {
  const reports = [
    report('01 Nov 2026', 'Penjualan', 100000, [detail('Modal Penjualan', 30000), detail('Lain lain', 1000)]),
    report('01 Nov 2026', 'Belanja', 55000, [detail('Ongkir', 5000)]),
    report('01 Nov 2026', 'Biaya Lain Lain', 5000, [detail('Ongkos Kirim Belanja', 5000)]),
    report('01 Nov 2026', 'Kupat Tahu Belanja', 75000)
  ];
  const parameters = [{ key: 'rent', type: 'cost', amount: 600000 }, { key: 'tax', type: 'cost', amount: 250000 }, { key: 'brilink', type: 'income', amount: 1000000 }];
  const values = [{ parameterKey: 'rent', month: 'November 2026', amount: 500000 }, { parameterKey: 'tax', month: 'November 2026', amount: 0 }, { parameterKey: 'brilink', month: 'November 2026', amount: 300000 }];
  assert.equal(getAnnualFinance(reports, parameters, values, 2026).rows[10].costs, 506000);
});

test('empty months remain zero instead of generating recurring expenses for the entire year', () => {
  const parameters = [{ key: 'rent', type: 'cost', amount: 600000 }];
  const result = getAnnualFinance([report('01 Jul 2026', 'Penjualan', 50000)], parameters, [], 2026);
  assert.equal(result.rows[6].costs, 600000);
  assert.equal(result.rows[11].costs, 0);
  assert.equal(result.totals.costs, 600000);
  assert.deepEqual(getAnnualFinance([], parameters, [], 2025).totals, { omset: 0, salary: 0, grossIncome: 0, costs: 0 });
});

test('year boundaries and months containing only saved costs are respected', () => {
  const reports = [report('2025-12-31', 'Penjualan', 50000), report('01 Jan 2026', 'Penjualan', 100000), report('31 Des 2026', 'Penjualan', 200000), report('01 Jan 2027', 'Penjualan', 400000)];
  const parameters = [{ key: 'rent', type: 'cost', amount: 600000 }];
  const values = [{ parameterKey: 'rent', month: 'Mei 2026', amount: 700000 }];
  const result = getAnnualFinance(reports, parameters, values, 2026);
  assert.equal(result.totals.omset, 300000);
  assert.equal(result.rows[4].costs, 700000);
  assert.deepEqual(getAnnualFinanceYears(reports, [{ parameterKey: 'rent', month: 'Maret 2024', amount: 1 }], 2026), [2027, 2026, 2025, 2024]);
});

test('detail quantities and negative gross income are preserved without mutating source data', () => {
  const reports = [report('01 Nov 2026', 'Penjualan', 10000, [detail('Modal Penjualan', 10000, 2)])];
  const before = JSON.stringify(reports);
  assert.equal(getAnnualFinance(reports, [], [], 2026).totals.grossIncome, -10000);
  assert.equal(JSON.stringify(reports), before);
});
