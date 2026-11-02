const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const database = path.join(root, 'data', `savings-ui-${crypto.randomUUID()}.sqlite`);
const screenshots = path.join(root, 'data', 'backups', 'savings-ui');
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
      BETTER_AUTH_SECRET: 'savings-ui-tests-only-secret-more-than-32-characters', NODE_ENV: 'production' }
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
  const login = await page.request.post(`${base}/api/login`, { data: { username: 'Admin', password: 'admin123' } });
  assert.equal(login.status(), 200);
  for (const [date, category, amount, direction, note] of [
    [`${year - 1}-12-31`, 'Tabungan', 1000000, 'credit', 'Saldo tahun sebelumnya'],
    [`${year}-10-01`, 'Tabungan', 2000000, 'credit', 'Setoran Oktober'],
    [`${year}-11-01`, 'Tabungan', 4000000, 'credit', 'Nabung bulanan'],
    [`${year}-11-02`, 'Tabungan', 500000, 'debit', 'Beli HP'],
    [`${year}-11-01`, 'Uang Mamah', 750000, 'credit', 'Titipan Mamah'],
    [`${year}-12-01`, 'Tabungan', 9000000, 'credit', 'Setoran Desember'],
    [`${year}-11-02`, 'Belum Dikategorikan', 50000, 'credit', 'Transaksi lama']
  ]) {
    const result = await page.request.post(`${base}/api/savings`, { data: { date, category, amount, direction, note } });
    assert.equal(result.status(), 200, await result.text());
  }
  await page.goto(base);
  await page.getByPlaceholder('Masukkan username').fill('Admin');
  await page.getByPlaceholder('Masukkan password').fill('admin123');
  await page.getByRole('button', { name: 'Masuk ke Aplikasi', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle Tabungan', exact: true }).click();
  await page.getByRole('button', { name: 'Saldo Tabungan', exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter tahun tabungan' }).selectOption(String(year));
  await page.getByRole('combobox', { name: 'Filter bulan tabungan' }).selectOption('10');
  const categoryButton = page.locator('#savings-category-heading-0');
  assert.equal(await categoryButton.getAttribute('aria-expanded'), 'false');
  await categoryButton.click();
  const panel = page.locator('#savings-category-panel-0');
  await panel.waitFor({ state: 'visible' });
  const table = panel.getByRole('table');
  assert.ok((await table.innerText()).includes('3.000.000'));
  assert.ok((await table.innerText()).includes('6.500.000'));
  assert.ok((await table.innerText()).includes('Nabung bulanan'));
  assert.ok(!(await table.innerText()).includes('Setoran Desember'));
  await page.locator('#savings-category-heading-1').click();
  assert.equal(await categoryButton.getAttribute('aria-expanded'), 'true', 'Other categories may remain open');
  await categoryButton.click();
  assert.equal(await categoryButton.getAttribute('aria-expanded'), 'false');
  await categoryButton.focus();
  await page.keyboard.press('Enter');
  assert.equal(await categoryButton.getAttribute('aria-expanded'), 'true');
  fs.mkdirSync(screenshots, { recursive: true });
  await page.getByRole('heading', { name: 'Detail per Kategori', exact: true }).click();
  await page.getByRole('heading', { name: 'Detail per Kategori', exact: true }).evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top - 100));
  await page.screenshot({ path: path.join(screenshots, 'desktop.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1);
  await page.getByRole('heading', { name: 'Detail per Kategori', exact: true }).evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top - 100));
  await page.screenshot({ path: path.join(screenshots, 'mobile.png'), animations: 'disabled' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'No horizontal overflow outside tables');
  const box = await categoryButton.boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 391, 'Category header fits mobile viewport');
  await page.getByRole('combobox', { name: 'Filter bulan tabungan' }).selectOption('8');
  assert.ok((await panel.innerText()).includes('Tidak ada transaksi pada September'));
  assert.ok((await panel.innerText()).includes('1.000.000'));
  await page.getByRole('combobox', { name: 'Filter tahun tabungan' }).selectOption(String(year - 1));
  await page.getByRole('combobox', { name: 'Filter bulan tabungan' }).selectOption('all');
  assert.ok((await panel.innerText()).includes('Saldo tahun sebelumnya'));
  await page.getByRole('combobox', { name: 'Filter tahun tabungan' }).selectOption(String(year));
  await page.getByRole('combobox', { name: 'Filter bulan tabungan' }).selectOption('10');
  await panel.getByRole('button', { name: 'Edit kategori transaksi Beli HP', exact: true }).click();
  const editDialog = page.getByRole('dialog');
  await editDialog.getByRole('combobox').selectOption('Uang Bapa');
  await editDialog.getByRole('button', { name: 'Simpan Kategori', exact: true }).click();
  await editDialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(() => !document.querySelector('#savings-category-panel-0').textContent.includes('Beli HP'));
  const bapaButton = page.locator('#savings-category-heading-2');
  await bapaButton.click();
  const bapa = page.locator('#savings-category-panel-2');
  assert.ok((await bapa.innerText()).includes('-500.000'));
  await bapa.getByRole('button', { name: 'Hapus transaksi Beli HP', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus Transaksi', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => !document.querySelector('#savings-category-panel-2').textContent.includes('Beli HP'));
  assert.ok((await bapa.innerText()).includes('Tidak ada transaksi'));
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: 'PASS', desktop: '1440x1000', mobile: '390x844', filters: 'month and year', categories: 'independent expand/collapse + keyboard', balances: 'opening and running balances verified', editDelete: 'PASS on isolated SQLite', productionDataTouched: false, screenshots }));
}
main().catch((error) => { console.error(error); console.error(output.slice(-5000)); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server && server.exitCode === null) { server.kill(); await once(server, 'exit'); }
  for (const suffix of ['', '-wal', '-shm']) try { fs.rmSync(database + suffix, { force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
});
