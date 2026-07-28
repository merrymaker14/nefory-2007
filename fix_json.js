// Починка кириллицы в JSON после порчи PowerShell'ом и перезапись строго в UTF-8.
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'assets', 'models', 'room_emo_colliders.json');

// PowerShell дописал в начало метку BOM — JSON.parse на неё ругается
const raw = fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
const data = JSON.parse(raw);

const LABELS = {
  monitor: { label: 'включить монитор', labelOff: 'выключить монитор' },
  ceiling: { label: 'включить свет',    labelOff: 'выключить свет'    },
};
for (const it of data.interactables || []) {
  if (LABELS[it.id]) Object.assign(it, LABELS[it.id]);
}

// числа могли уехать в строки после ConvertTo-Json — приводим обратно
const num = v => Array.isArray(v) ? v.map(Number) : Number(v);
data.room.min = num(data.room.min);
data.room.max = num(data.room.max);
data.spawn = num(data.spawn);
data.eyeHeight = Number(data.eyeHeight);
data.playerRadius = Number(data.playerRadius);
data.spawnYaw = Number(data.spawnYaw);
for (const c of data.colliders) { c.min = num(c.min); c.max = num(c.max); }
for (const it of data.interactables) {
  it.aim.center = num(it.aim.center);
  it.aim.radius = Number(it.aim.radius);
  if (it.screen) { it.screen.center = num(it.screen.center); it.screen.size = num(it.screen.size); }
  if (it.light)  { it.light.pos = num(it.light.pos);
                   it.light.intensity = Number(it.light.intensity);
                   it.light.distance = Number(it.light.distance); }
}

fs.writeFileSync(p, JSON.stringify(data, null, 1), { encoding: 'utf8' });

console.log('Подписи:');
for (const it of data.interactables) console.log('  %s: "%s" / "%s"', it.id, it.label, it.labelOff);
console.log('spawn %s  eyeHeight %s  комната %s .. %s',
  data.spawn.join(','), data.eyeHeight, data.room.min.join(','), data.room.max.join(','));
console.log('лайтмапы:', data.lightmaps);
