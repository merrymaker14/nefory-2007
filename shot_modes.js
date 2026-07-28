// Проверка выбора режима управления: мышь или сенсор.
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8123/src/';

const CASES = [
  { name: 'десктоп, мышь',            url: BASE,                 ctx: {},                          expect: false },
  { name: 'телефон iPhone 13',        url: BASE,                 ctx: { ...devices['iPhone 13'] }, expect: true  },
  { name: 'планшет iPad gen 7',       url: BASE,                 ctx: { ...devices['iPad (gen 7)'] }, expect: true },
  { name: 'телефон, но ?touch=0',     url: BASE + '?touch=0',    ctx: { ...devices['iPhone 13'] }, expect: false },
  { name: 'десктоп, но ?touch=1',     url: BASE + '?touch=1',    ctx: {},                          expect: true  },
];

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  let ok = true;
  for (const c of CASES) {
    const ctx = await browser.newContext(c.ctx);
    const page = await ctx.newPage();
    await page.goto(c.url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(
      () => document.querySelector('#bar i').style.width === '100%', null, { timeout: 90000 });
    const r = await page.evaluate(() => ({
      touch:  document.body.classList.contains('touch'),
      coarse: matchMedia('(pointer: coarse)').matches,
      mouse:  matchMedia('(any-pointer: fine)').matches,
      pts:    navigator.maxTouchPoints,
    }));
    const good = r.touch === c.expect;
    if (!good) ok = false;
    console.log(
      (good ? 'OK   ' : 'ОШИБКА ') + c.name.padEnd(24) +
      ' режим: ' + (r.touch ? 'сенсор' : 'мышь ').padEnd(7) +
      ' | основной указатель грубый: ' + String(r.coarse).padEnd(5) +
      ' | мышь есть: ' + String(r.mouse).padEnd(5) +
      ' | точек касания: ' + r.pts);
    await ctx.close();
  }
  await browser.close();
  console.log(ok ? '\nВсе режимы определяются верно.' : '\nЕСТЬ ОШИБКИ.');
  process.exit(ok ? 0 : 1);
})();
