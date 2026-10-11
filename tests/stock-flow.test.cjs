const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const ts = require('typescript');
const { serializeSignedCookie } = require('better-call');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', `stock-test-${crypto.randomUUID()}.sqlite`);
process.env.TURSO_DATABASE_URL = `file:${file.replaceAll('\\', '/')}`;
process.env.DATABASE_URL = process.env.TURSO_DATABASE_URL;
process.env.BETTER_AUTH_SECRET = 'stock-tests-only-secret-with-more-than-32-characters';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
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
  const requireOriginal = mod.require.bind(mod);
  mod.require = (name) => {
    if (name.startsWith('@/')) {
      const target = path.join(root, 'src', name.slice(2));
      return load(fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, 'index.ts'));
    }
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), name);
      if (fs.existsSync(`${target}.ts`)) return load(`${target}.ts`);
    }
    return requireOriginal(name);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText, filename);
  return mod.exports;
}

let libsql, ensureDatabase, adminCookie, operatorCookie;
const handlers = {};
const date = '2026-10-01';
const item = (qty, extra = {}) => ({ code: 'BB-001', name: 'TORTILLA BESAR', qty, price: 1450, buy: 1450, sell: 15000, ...extra });
const distribution = (qty, extra = {}) => ({ date, destination: 'wadas', destinationName: 'Kios Wadas', items: [item(qty)], ...extra });
const sale = (qty, extra = {}) => ({ date, kiosk: 'Kios Wadas', kioskKey: 'wadas', items: [item(qty)], ...extra });
const opname = (systemStock, physicalStock, extra = {}) => ({ date, locationKey: 'wadas', locationName: 'Kios Wadas', items: [{ materialCode: 'BB-001', materialName: 'TORTILLA BESAR', systemStock, physicalStock, note: 'Hitung stok fisik' }], ...extra });
async function send(name, body, options = {}) {
  const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': options.key ?? crypto.randomUUID() };
  if (options.cookie !== null) headers.Cookie = options.cookie ?? adminCookie;
  const response = await handlers[name].POST(new Request(`http://localhost:3000/api/${name}`, { method: 'POST', headers, body: JSON.stringify(body) }));
  return { status: response.status, data: await response.json() };
}
async function qty(location, code = 'BB-001') {
  return Number((await libsql.execute({ sql: 'SELECT qty FROM stock_balances WHERE material_code=? AND location_key=?', args: [code, location] })).rows[0].qty);
}
async function count(table) { return Number((await libsql.execute(`SELECT COUNT(*) AS n FROM ${table}`)).rows[0].n); }
async function reset(gudang = 0, wadas = 0, pack = 100) {
  await libsql.executeMultiple("DROP TRIGGER IF EXISTS fail_details; DELETE FROM stock_requests; DELETE FROM stock_movements; DELETE FROM stock_baselines; DELETE FROM transaction_details; DELETE FROM transactions; DELETE FROM stock_opnames; DELETE FROM daily_performance; UPDATE stock_balances SET qty=0; UPDATE materials SET buy=1450 WHERE code='BB-001';");
  for (const [location, code, value] of [['gudang', 'BB-001', gudang], ['wadas', 'BB-001', wadas], ['wadas', 'BB-021', pack]]) {
    await libsql.execute({ sql: 'UPDATE stock_balances SET qty=? WHERE location_key=? AND material_code=?', args: [value, location, code] });
  }
}
async function mutation(start = date, end = date) {
  const response = await handlers['stock-mutations'].GET(new Request(`http://localhost:3000/api/stock-mutations?startDate=${start}&endDate=${end}&locationKey=wadas&materialCode=BB-001`, { headers: { Cookie: adminCookie } }));
  assert.equal(response.status, 200);
  return response.json();
}

before(async () => {
  ({ libsql, ensureDatabase } = load('src/db/index.ts'));
  await ensureDatabase();
  const now = Math.floor(Date.now() / 1000);
  for (const [id, role] of [['test-admin', 'Admin'], ['test-operator', 'Operator']]) {
    await libsql.execute({ sql: 'INSERT INTO user(id,name,email,email_verified,role,created_at,updated_at) VALUES(?,?,?,1,?,?,?)', args: [id, id, `${id}@test.local`, role, now, now] });
    await libsql.execute({ sql: 'INSERT INTO session(id,token,user_id,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?)', args: [id, `token-${id}`, id, now + 7 * 86400, now, now] });
  }
  adminCookie = (await serializeSignedCookie('better-auth.session_token', 'token-test-admin', process.env.BETTER_AUTH_SECRET)).split(';')[0];
  operatorCookie = (await serializeSignedCookie('better-auth.session_token', 'token-test-operator', process.env.BETTER_AUTH_SECRET)).split(';')[0];
  for (const name of ['purchases', 'distributions', 'sales', 'stock-opname', 'stock-mutations', 'users', 'bootstrap']) handlers[name] = load(`src/app/api/${name}/route.ts`);
});

test('all stock mutations require a real authenticated session', async () => {
  await reset(10, 10);
  for (const [name, body] of [['purchases', { date, items: [item(1)] }], ['distributions', distribution(1)], ['sales', sale(1)], ['stock-opname', opname(10, 9)]]) {
    assert.equal((await send(name, body, { cookie: null })).status, 401);
  }
  assert.equal(await count('transactions'), 0);
  assert.equal(await qty('wadas'), 10);
});

test('normal flow conserves stock and computes packages and money on the server', async () => {
  await reset();
  assert.equal((await send('purchases', { date, items: [item(100)], shippingCost: 10000 })).status, 200);
  assert.equal((await send('distributions', distribution(40))).status, 200);
  const result = await send('sales', sale(10, { totalSales: 1, modal: 1, costs: { salary: 1000, otherCost: 500, grabGofood: 2000, qris: 3000 } }));
  assert.equal(result.status, 200, JSON.stringify(result.data));
  assert.equal(await qty('gudang'), 60);
  assert.equal(await qty('wadas'), 30);
  assert.equal(await qty('wadas', 'BB-021'), 90);
  const header = (await libsql.execute({ sql: 'SELECT total FROM transactions WHERE number=?', args: [result.data.number] })).rows[0];
  assert.equal(Number(header.total), 150000);
  const modal = (await libsql.execute({ sql: 'SELECT price FROM transaction_details WHERE transaction_number=? AND item=?', args: [result.data.number, 'Modal Penjualan'] })).rows[0];
  assert.equal(Number(modal.price), 21100);
  const report = await mutation();
  assert.equal(report.summary.openingStock, 0);
  assert.equal(report.summary.endingStock, 30);
  assert.equal(report.integrity.openingVerified, true);
  assert.equal(await count('stock_movements'), 5);
  assert.equal(await count('transactions'), 4);
});

test('sales and distributions reject insufficient stock without any writes', async () => {
  await reset(3, 3);
  for (const [name, body] of [['sales', sale(5)], ['distributions', distribution(5)]]) {
    const result = await send(name, body);
    assert.equal(result.status, 409, JSON.stringify(result.data));
  }
  assert.equal(await qty('gudang'), 3);
  assert.equal(await qty('wadas'), 3);
  assert.equal(await count('transactions'), 0);
  assert.equal(await count('stock_movements'), 0);
  assert.equal(await count('stock_requests'), 0);
});

test('insufficient automatic packaging rejects the entire sale', async () => {
  await reset(0, 10, 1);
  assert.equal((await send('sales', sale(2))).status, 409);
  assert.equal(await qty('wadas'), 10);
  assert.equal(await qty('wadas', 'BB-021'), 1);
  assert.equal(await count('transactions'), 0);
});

test('purchase only changes prices for materials that were actually bought', async () => {
  await reset();
  const result = await send('purchases', { date, items: [item(2), { code: 'BB-002', name: 'TORTILLA SEDANG', qty: 0, price: 1 }] });
  assert.equal(result.status, 200);
  assert.equal(Number((await libsql.execute("SELECT buy FROM materials WHERE code='BB-002'")).rows[0].buy), 1350);
});

test('concurrent distributions preserve the total across locations', async () => {
  await reset(10);
  const results = await Promise.all([send('distributions', distribution(4)), send('distributions', distribution(4, { destination: 'ciherang', destinationName: 'Kios Ciherang' }))]);
  assert.deepEqual(results.map((r) => r.status), [200, 200], JSON.stringify(results));
  assert.equal(await qty('gudang'), 2);
  assert.equal((await qty('gudang')) + (await qty('wadas')) + (await qty('ciherang')), 10);
});

test('concurrent withdrawals cannot oversell the same stock', async () => {
  await reset(0, 5);
  const results = await Promise.all([send('sales', sale(4)), send('sales', sale(4))]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409], JSON.stringify(results));
  assert.equal(await qty('wadas'), 1);
  assert.equal(await count('transactions'), 1);
});

test('opname rejects stale snapshots and Operator access', async () => {
  await reset(0, 10);
  assert.equal((await send('sales', sale(2))).status, 200);
  assert.equal((await send('stock-opname', opname(10, 10))).status, 409);
  assert.equal((await send('stock-opname', opname(8, 8), { cookie: operatorCookie })).status, 403);
  assert.equal(await qty('wadas'), 8);
  assert.equal(await count('stock_opnames'), 0);
});

test('opname records the actual adjustment and reason; unchanged opname remains visible', async () => {
  await reset(0, 10);
  assert.equal((await send('stock-opname', opname(10, 9, { items: [{ materialCode: 'BB-001', materialName: 'TORTILLA BESAR', systemStock: 10, physicalStock: 9 }] }))).status, 400);
  assert.equal((await send('stock-opname', opname(10, 9))).status, 200);
  assert.equal((await send('stock-opname', opname(9, 9))).status, 200);
  const report = await mutation();
  assert.equal(report.rows.length, 2);
  assert.equal(report.rows[0].balance, 9);
  assert.equal(report.rows[1].balance, 9);
  assert.equal(report.reconciliation.label, 'Sesuai');
});

test('failure saving details rolls back stock, master prices, header, ledger, and request key', async () => {
  await reset(4);
  await libsql.execute("CREATE TRIGGER fail_details BEFORE INSERT ON transaction_details BEGIN SELECT RAISE(ABORT, 'injected detail failure'); END;");
  const key = crypto.randomUUID();
  const body = { date, items: [item(5, { price: 2000 })], shippingCost: 10000 };
  const result = await send('purchases', body, { key });
  assert.equal(result.status, 500);
  assert.equal(await qty('gudang'), 4);
  for (const table of ['transactions', 'stock_movements', 'stock_baselines', 'stock_requests']) assert.equal(await count(table), 0);
  assert.equal(Number((await libsql.execute("SELECT buy FROM materials WHERE code='BB-001'")).rows[0].buy), 1450);
  await libsql.execute('DROP TRIGGER fail_details');
  assert.equal((await send('purchases', body, { key })).status, 200);
  assert.equal(await qty('gudang'), 9);
});

test('retries and simultaneous duplicate requests are idempotent', async () => {
  await reset(10);
  const key = crypto.randomUUID();
  const results = await Promise.all([send('distributions', distribution(2), { key }), send('distributions', distribution(2), { key })]);
  assert.deepEqual(results.map((r) => r.status), [200, 200]);
  assert.equal(results[0].data.number, results[1].data.number);
  assert.equal((await send('distributions', distribution(2), { key })).data.number, results[0].data.number);
  assert.equal((await send('distributions', distribution(3), { key })).status, 409);
  assert.equal(await qty('gudang'), 8);
  assert.equal(await count('transactions'), 1);
});

test('master identities, destination, quantities, and PACK cannot be spoofed', async () => {
  await reset(10, 10);
  const cases = [
    ['distributions', distribution(1, { destinationName: 'Kios Ciherang' })],
    ['distributions', distribution(1, { destination: 'gudang', destinationName: 'Gudang Utama' })],
    ['sales', sale(1, { items: [item(1, { name: 'ROTI BURGER' })] })],
    ['sales', sale(1, { items: [item(1), { code: 'BB-021', qty: 0 }] })],
    ['distributions', distribution(1, { items: [item(-1)] })],
    ['distributions', distribution(1, { items: [item(0.5)] })],
    ['distributions', distribution(1, { items: [item(1), item(1)] })],
    ['purchases', { date, items: [item(1, { price: -1 })] }]
  ];
  for (const [name, body] of cases) assert.equal((await send(name, body)).status, 400, JSON.stringify(body));
  assert.equal(await count('transactions'), 0);
});

test('a missing balance fails the whole distribution rather than silently losing stock', async () => {
  await reset(10);
  await libsql.execute("DELETE FROM stock_balances WHERE location_key='wadas' AND material_code='BB-001'");
  assert.equal((await send('distributions', distribution(2))).status, 409);
  assert.equal(await qty('gudang'), 10);
  await libsql.execute("INSERT INTO stock_balances(material_code,location_key,qty) VALUES('BB-001','wadas',0)");
});

test('backdated transactions and opname cannot overwrite later stock history', async () => {
  await reset(10, 10);
  assert.equal((await send('sales', sale(2, { date: '2026-10-03' }))).status, 200);
  assert.equal((await send('stock-opname', opname(8, 7, { date: '2026-10-02' }))).status, 409);
  assert.equal((await send('distributions', distribution(1, { date: '2026-10-02' }))).status, 409);
  assert.equal(await qty('wadas'), 8);
});

test('invalid calendar dates and empty transactions are rejected', async () => {
  await reset(10);
  for (const badDate of ['', '2026-02-30', 'not-a-date', '2099-01-01']) assert.equal((await send('distributions', distribution(1, { date: badDate }))).status, 400);
  assert.equal((await send('distributions', distribution(0))).status, 400);
});

test('legacy clipped sales and stale opname are flagged without rewriting old rows', async () => {
  await reset(0, 10);
  await libsql.executeMultiple(`
    INSERT INTO stock_opnames(date,number,location,material,system_stock,physical_stock,difference,officer) VALUES('01 Okt 2026','OPN-1700000000000','Kios Wadas','TORTILLA BESAR',3,3,0,'Legacy');
    INSERT INTO transactions(number,date,type,location,note,total) VALUES('PNJ-1700000000001','01 Okt 2026','Penjualan','Kios Wadas','Legacy',75000);
    INSERT INTO transaction_details(transaction_number,item,qty,price,activity) VALUES('PNJ-1700000000001','TORTILLA BESAR',5,15000,'Legacy');
    INSERT INTO stock_opnames(date,number,location,material,system_stock,physical_stock,difference,officer) VALUES('01 Okt 2026','OPN-1700000000002','Kios Wadas','TORTILLA BESAR',3,10,7,'Legacy');
  `);
  const beforeRows = JSON.stringify((await libsql.execute('SELECT * FROM stock_opnames')).rows);
  const report = await mutation();
  assert.equal(report.integrity.openingVerified, false);
  assert.equal(report.reconciliation.label, 'Perlu Rekonsiliasi');
  assert.equal(report.summary.openingStock, 3);
  assert.equal(report.rows.find((r) => r.source === 'Penjualan').outQty, 3);
  assert.equal(report.rows.at(-1).balance, 10);
  assert.equal(beforeRows, JSON.stringify((await libsql.execute('SELECT * FROM stock_opnames')).rows));
  assert.equal(Number((await libsql.execute('SELECT qty FROM transaction_details')).rows[0].qty), 5);
});

test('new stock baselines keep later periods accurate while retaining legacy warnings', async () => {
  await reset(10, 10);
  await libsql.execute("INSERT INTO stock_opnames(date,number,location,material,system_stock,physical_stock,difference,officer) VALUES('30 Sep 2026','OPN-1700000000000','Kios Wadas','TORTILLA BESAR',10,10,0,'Legacy')");
  assert.equal((await send('sales', sale(2))).status, 200);
  const report = await mutation();
  assert.equal(report.integrity.openingVerified, true);
  assert.equal(report.summary.openingStock, 10);
  assert.equal(report.summary.endingStock, 8);
  assert.equal(await count('stock_opnames'), 1);
});

test('Operator can transact but cannot change users or monthly parameters', async () => {
  await reset(10);
  assert.equal((await send('distributions', distribution(1), { cookie: operatorCookie })).status, 200);
  assert.equal((await send('users', { name: 'intruder', password: 'password123', role: 'Admin' }, { cookie: operatorCookie })).status, 403);
  const response = await handlers.bootstrap.PATCH(new Request('http://localhost:3000/api/bootstrap', { method: 'PATCH', headers: { Cookie: operatorCookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ parameterKey: 'brilink', amount: 1, month: 'Oktober 2026' }) }));
  assert.equal(response.status, 403);
});

after(async () => {
  if (libsql) libsql.close();
  // Generated test databases are isolated and ignored by Git.
  for (const suffix of ['', '-wal', '-shm']) {
    try { fs.rmSync(file + suffix, { force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
  }
});
