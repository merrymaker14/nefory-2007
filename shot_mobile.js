// Проверка мобильной версии: эмулируем телефон, тыкаем пальцем, снимаем.
const { chromium, devices } = require('playwright');
const path = require('path'); const fs = require('fs');

const BASE = process.env.BASE || 'http://localhost:8123/src/';
const OUT  = path.join(__dirname, 'renders', 'web');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });

  for (const [name, dev] of [['iphone', devices['iPhone 13']],
                             ['android', devices['Pixel 7']]]) {
    const ctx = await browser.newContext({ ...dev, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

    process.stdout.write(`${name} (${dev.viewport.width}x${dev.viewport.height}) ... `);
    await page.goto(BASE, { waitUntil: 'load', timeout: 90000 });

    // ждём, пока модель догрузится: полоса прогресса дойдёт до 100 %
    await page.waitForFunction(
      () => document.querySelector('#bar i').style.width === '100%',
      null, { timeout: 90000 });
    await page.waitForTimeout(400);

    // сенсорный ли режим включился
    const isTouch = await page.evaluate(() => document.body.classList.contains('touch'));

    await page.screenshot({ path: path.join(OUT, `m_${name}_1_start.png`) });

    // входим в игру
    await page.tap('#go');
    await page.waitForTimeout(600);
    const playing = await page.evaluate(() => document.body.classList.contains('playing'));
    await page.screenshot({ path: path.join(OUT, `m_${name}_2_play.png`) });

    // ведём пальцем по левой половине — джойстик должен появиться
    const w = dev.viewport.width, h = dev.viewport.height;
    await page.touchscreen.tap(w * 0.22, h * 0.72);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, `m_${name}_3_stick.png`) });

    console.log(`ок  touch=${isTouch} playing=${playing}` +
                (errs.length ? `  ОШИБКИ: ${errs.slice(0,2).join(' | ')}` : ''));
    await ctx.close();
  }
  await browser.close();
  console.log('Снимки:', path.relative(__dirname, OUT));
})();
