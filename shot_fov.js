// Сравнение углов обзора с одной точки — чтобы подобрать ощущение роста.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');

const BASE = 'http://localhost:8123/src/';
const OUT  = path.join(__dirname, 'renders', 'web');
const CAM  = '0.55,1.60,0.55';
const LOOK = '-1.35,0.95,0.10';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('  [ошибка]', e.message));
  for (const fov of [68, 60, 55, 48]) {
    const url = `${BASE}?shot=1&cam=${CAM}&look=${LOOK}&monitor=1&light=0&fov=${fov}`;
    process.stdout.write(`fov ${fov} ... `);
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction('window.__sceneReady === true', null, { timeout: 60000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `fov_${fov}.png`) });
    console.log('ок');
  }
  await browser.close();
})();
