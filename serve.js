// Мини-сервер статики для локального запуска сцены.
// Запуск:  node serve.js        ->  http://localhost:8123/src/
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 8123;

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.glb':'model/gltf-binary',
  '.gltf':'model/gltf+json', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.webp':'image/webp', '.ktx2':'image/ktx2',
  '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wasm':'application/wasm',
  '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^([\\/])+/, ''));

  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('not found: ' + rel); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => {
  console.log('Сцена: http://localhost:' + PORT + '/src/');
  console.log('Корень: ' + ROOT);
});
