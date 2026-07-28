// Снимки сцены через Playwright — чтобы проверять результат самому, а не глазами человека.
// Запуск:  node shot.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// по умолчанию локальный сервер; BASE=... снимает опубликованную версию
const BASE = process.env.BASE || 'http://localhost:8123/src/';
const OUT  = path.join(__dirname, 'renders', 'web');

// камера и точка взгляда в координатах three.js
const SHOTS = [
  // свет выключён — состояние по умолчанию, вечернее настроение
  { name:'01_dark_spawn',   cam:'0.90,1.65,1.20',  look:'-1.20,1.05,0.20', monitor:0, light:0 },
  { name:'02_dark_desk',    cam:'-0.20,1.62,0.75', look:'-1.55,1.00,0.05', monitor:1, light:0 },
  { name:'03_dark_bed',     cam:'-0.60,1.62,-0.40',look:'1.35,0.85,0.55',  monitor:1, light:0 },
  // свет включён
  { name:'04_lit_spawn',    cam:'0.90,1.65,1.20',  look:'-1.20,1.05,0.20', monitor:0, light:1 },
  { name:'05_lit_bed',      cam:'-0.60,1.62,-0.40',look:'1.35,0.85,0.55',  monitor:0, light:1 },
  { name:'06_lit_wardrobe', cam:'-0.90,1.60,0.70', look:'0.20,1.10,-1.55', monitor:0, light:1 },
  { name:'07_screen_close', cam:'-0.62,1.15,0.20', look:'-1.20,0.94,0.17', monitor:1, light:0 },
  { name:'08_switch',       cam:'0.35,1.60,0.35',  look:'-1.55,1.43,1.52', monitor:0, light:1 },
  { name:'08b_switch_near', cam:'-0.55,1.52,0.95', look:'-1.56,1.43,1.55', monitor:0, light:1 },
  { name:'09_window',       cam:'0.30,1.60,0.20',  look:'0.05,1.35,-1.75', monitor:0, light:1 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=default', '--enable-unsafe-swiftshader',
           '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 },
                                       deviceScaleFactor: 1 });
  page.on('console',    m => { if (m.type() === 'error') console.log('  [консоль]', m.text()); });
  page.on('pageerror',  e => console.log('  [ошибка страницы]', e.message));

  for (const s of SHOTS) {
    const url = `${BASE}?shot=1&cam=${s.cam}&look=${s.look}` +
                `&monitor=${s.monitor}&light=${s.light ?? 0}`;
    process.stdout.write(`${s.name} ... `);
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForFunction('window.__sceneReady === true', null, { timeout: 60000 });
      await page.waitForTimeout(700);            // дать эквалайзеру и текстурам устояться
      const file = path.join(OUT, s.name + '.png');
      await page.screenshot({ path: file });
      console.log('ок ->', path.relative(__dirname, file));
    } catch (e) {
      console.log('НЕ ВЫШЛО:', e.message.split('\n')[0]);
      const err = await page.$eval('#err', el => el.textContent).catch(() => '');
      if (err) console.log('   сообщение страницы:', err);
    }
  }

  await browser.close();
  console.log('Готово. Папка:', path.relative(__dirname, OUT));
})();
