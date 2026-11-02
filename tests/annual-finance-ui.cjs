const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const database = path.join(root, 'data', `annual-ui-${crypto.randomUUID()}.sqlite`);
const screenshots = path.join(root, 'data', 'backups', 'annual-finance-ui');
const year = new Date().getFullYear();
let server, browser, output = '';

async function main() {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const base = `http://localhost:${port}`;
  server = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '--port', String(port)], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env,
      TURSO_DATABASE_URL: `file:${database.replaceAll('\\', '/')}`, DATABASE_URL: `file:${database.replaceAll('\\', '/')}`,
      TURSO_AUTH_TOKEN: '', DATABASE_AUTH_TOKEN: '', BETTER_AUTH_URL: base,
      BETTER_AUTH_SECRET: 'annual-finance-ui-secret-more-than-32-characters', NODE_ENV: 'production' }
  });
  server.stdout.on('data', (data) => { output += data.toString(); });
  server.stderr.on('data', (data) => { output += data.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    if (server.exitCode !== null) throw new Error(output);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready);
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  assert.equal((await page.request.post(`${base}/api/login`, { data: { username: 'Admin', password: 'admin123' } })).status(), 200);
  const initial = await (await page.request.get(`${base}/api/bootstrap`)).json();
  const date = `${year}-01-01`;
  const sale = await page.request.post(`${base}/api/sales`, { headers: { 'Idempotency-Key': crypto.randomUUID() }, data: {
    date, kiosk: 'Kios Wadas', kioskKey: 'wadas', items: [{ code: 'BB-001', name: 'TORTILLA BESAR', qty: 10 }],
    costs: { salary: 1000, otherCost: 200, qris: 500, grabGofood: 1000 }
  } });
  assert.equal(sale.status(), 200, await sale.text());
  assert.equal((await page.request.post(`${base}/api/kupat-tahu`, { data: { date, kind: 'Penjualan', portionQty: 10, salary: 2000, otherCost: 300, qris: 1000 } })).status(), 200);
  assert.equal((await page.request.post(`${base}/api/expenses`, { data: { date, kind: 'Biaya uji tahunan', location: 'Umum', amount: 3000 } })).status(), 200);
  for (const parameter of initial.monthlyParameters.filter((row) => row.type === 'cost')) {
    assert.equal((await page.request.patch(`${base}/api/bootstrap`, { data: { month: `Januari ${year}`, parameterKey: parameter.key, amount: parameter.key === 'sewa_wadas' ? 1000 : 0 } })).status(), 200);
  }
  // Add a separate year's activity to test the year filter.
  assert.equal((await page.request.post(`${base}/api/expenses`, { data: { date: `${year - 1}-12-31`, kind: 'Biaya tahun lalu', location: 'Umum', amount: 777 } })).status(), 200);
  await page.goto(base);
  await page.getByPlaceholder('Masukkan username').fill('Admin');
  await page.getByPlaceholder('Masukkan password').fill('admin123');
  await page.getByRole('button', { name: 'Masuk ke Aplikasi', exact: true }).click();
  await page.getByRole('button', { name: 'Menu Report Tahunan', exact: true }).click();
  const yearFilter = page.getByRole('combobox', { name: 'Tahun report tahunan' });
  await yearFilter.selectOption(String(year));
  const table = page.getByRole('table', { name: `Report keuangan tahunan ${year}` });
  assert.equal(await table.locator('tbody tr').count(), 13);
  const january = await table.locator('tbody tr').first().innerText();
  assert.ok(january.includes('250.000'), january);
  assert.ok(january.includes('3.000'), january);
  assert.ok(january.includes('168.900'), january);
  assert.ok(january.includes('4.500'), january);
  const februaryCells = await table.locator('tbody tr').nth(1).locator('td').allTextContents();
  assert.deepEqual(februaryCells, ['Februari', '0', '0', '0', '0']);
  const [download] = await Promise.all([
    page.waitForEvent('download'), page.getByRole('button', { name: 'Export Excel', exact: true }).click()
  ]);
  assert.equal(download.suggestedFilename(), `report-tahunan-${year}.xls`);
  const exported = await (await page.request.get(`${base}/api/export?type=report-tahunan&year=${year}`)).text();
  assert.ok(exported.includes('<td>Januari</td><td>250000</td><td>3000</td><td>168900</td><td>4500</td>'));
  assert.ok(exported.includes(`Total ${year}`));
  assert.ok(!exported.includes('transactionNumber'));
  assert.equal((await page.request.get(`${base}/api/export?type=report-tahunan&year=nope`)).status(), 400);
  await yearFilter.selectOption(String(year - 1));
  assert.equal(await page.getByRole('table').locator('tbody tr').count(), 13);
  assert.ok((await page.getByRole('table').locator('tbody tr').nth(11).innerText()).includes('777'));
  await yearFilter.selectOption(String(year));
  fs.mkdirSync(screenshots, { recursive: true });
  await page.screenshot({ path: path.join(screenshots, 'desktop.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1);
  await page.screenshot({ path: path.join(screenshots, 'mobile.png'), animations: 'disabled' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const mobileMenu = page.locator('select').filter({ has: page.locator('option[value="Report Tahunan"]') });
  await mobileMenu.selectOption('Dashboard');
  await mobileMenu.selectOption('Report Tahunan');
  await page.getByRole('table', { name: `Report keuangan tahunan ${year}` }).waitFor();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ annualReportUI: 'PASS', months: 12, totalsRow: true, years: 'isolated', excelMatchesTable: true, desktop: '1440x1000', mobile: '390x844', productionDataTouched: false, screenshots }));
}
main().catch((error) => { console.error(error); console.error(output.slice(-5000)); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server && server.exitCode === null) { server.kill(); await once(server, 'exit'); }
  for (const suffix of ['', '-wal', '-shm']) try { fs.rmSync(database + suffix, { force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
});
