const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const database = path.join(root, 'data', `stock-http-${crypto.randomUUID()}.sqlite`);
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
let child, output = '';

async function main() {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const base = `http://localhost:${port}`;
  child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '--port', String(port)], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env,
      TURSO_DATABASE_URL: `file:${database.replaceAll('\\', '/')}`, DATABASE_URL: `file:${database.replaceAll('\\', '/')}`,
      TURSO_AUTH_TOKEN: '', DATABASE_AUTH_TOKEN: '', BETTER_AUTH_URL: base,
      BETTER_AUTH_SECRET: 'http-tests-only-secret-with-more-than-32-characters', NODE_ENV: 'production' }
  });
  child.stdout.on('data', (data) => { output += data.toString(); });
  child.stderr.on('data', (data) => { output += data.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    if (child.exitCode !== null) throw new Error(`Server failed: ${output}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Next server did not start');
  const anonymous = await fetch(`${base}/api/bootstrap`);
  assert.equal(anonymous.status, 401);
  async function login(username, password) {
    const response = await fetch(`${base}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ username, password }) });
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    const cookie = response.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ');
    assert.ok(cookie.includes('session_token'), 'Login must return a real session cookie');
    return cookie;
  }
  const admin = await login('Admin', 'admin123');
  const operator = await login('Operator', 'operator123');
  async function bootstrap(cookie = admin) {
    const response = await fetch(`${base}/api/bootstrap`, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200);
    return response.json();
  }
  async function post(route, body, cookie = admin, key = crypto.randomUUID()) {
    const response = await fetch(`${base}/api/${route}`, { method: 'POST', headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) });
    if (route === 'users' && response.ok) assert.ok(!response.headers.getSetCookie().some((value) => value.includes('session_token')), 'Creating a user must not replace the Admin session');
    return { status: response.status, data: await response.json() };
  }
  const initial = await bootstrap();
  const material = initial.materials.find((item) => item.code === 'BB-001');
  const key = crypto.randomUUID();
  const purchaseBody = { date, items: [{ code: material.code, name: material.name, qty: 3, price: material.buy }], shippingCost: 1000 };
  const purchase = await post('purchases', purchaseBody, admin, key);
  assert.equal(purchase.status, 200, JSON.stringify(purchase));
  assert.equal((await post('purchases', purchaseBody, admin, key)).data.number, purchase.data.number);
  assert.equal((await bootstrap()).materials.find((item) => item.code === material.code).stock.gudang, material.stock.gudang + 3);
  const distribution = await post('distributions', { date, destination: 'ciherang', destinationName: 'Kios Ciherang', items: [{ code: material.code, name: material.name, qty: 2 }] }, operator);
  assert.equal(distribution.status, 200, JSON.stringify(distribution));
  const sale = await post('sales', { date, kiosk: 'Kios Ciherang', kioskKey: 'ciherang', items: [{ code: material.code, name: material.name, qty: 1 }] }, operator);
  assert.equal(sale.status, 200, JSON.stringify(sale));
  const current = (await bootstrap()).materials.find((item) => item.code === material.code).stock.ciherang;
  assert.equal(current, material.stock.ciherang + 1);
  const opnameBody = { date, locationKey: 'ciherang', locationName: 'Kios Ciherang', items: [{ materialCode: material.code, materialName: material.name, systemStock: current, physicalStock: current + 1, note: 'Hitung fisik pengujian' }] };
  assert.equal((await post('stock-opname', opnameBody, operator)).status, 403);
  assert.equal((await post('stock-opname', opnameBody)).status, 200);
  const mutation = await fetch(`${base}/api/stock-mutations?startDate=${date}&endDate=${date}&materialCode=${material.code}&locationKey=ciherang`, { headers: { Cookie: admin } });
  const report = await mutation.json();
  assert.equal(mutation.status, 200, JSON.stringify(report));
  assert.equal(report.summary.endingStock, current + 1);
  assert.equal(report.integrity.openingVerified, true);
  assert.equal((await fetch(`${base}/api/users`, { headers: { Cookie: operator } })).status, 403);
  const created = await post('users', { name: 'HTTP Test User', password: 'password-for-http-test', role: 'Operator' });
  assert.equal(created.status, 200, JSON.stringify(created));
  assert.ok((await login('HTTP Test User', 'password-for-http-test')).includes('session_token'));
  assert.equal((await post('auth/sign-up/email', { name: 'Intruder', email: 'intruder@test.local', password: 'password123', role: 'Admin' })).status, 403);
  assert.equal((await fetch(`${base}/api/export?type=Monitoring%20Stok`, { headers: { Cookie: admin } })).status, 200);
  console.log(JSON.stringify({ httpTests: 'PASS', login: 'Admin and Operator cookies', flow: 'purchase-distribution-sale-opname-mutation', retries: 'deduplicated', roles: 'enforced', publicSignup: 'blocked', excel: 'authenticated', productionDatabaseUsed: false }));
}
main().catch((error) => { console.error(error); console.error(output.slice(-7000)); process.exitCode = 1; }).finally(async () => {
  if (child && child.exitCode === null) { child.kill(); await once(child, 'exit'); }
  for (const suffix of ['', '-wal', '-shm']) try { fs.rmSync(database + suffix, { force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
});
