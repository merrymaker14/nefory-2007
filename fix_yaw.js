const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'assets','models','room_emo_colliders.json');
const d=JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
// в three.js при рыскании 0 камера смотрит в -Z, значит forward = (-sin, -cos)
const [sx,,sz]=d.spawn, tx=-1.25, tz=0.15;
const dx=tx-sx, dz=tz-sz, len=Math.hypot(dx,dz);
const yaw=Math.atan2(-dx/len, -dz/len);
d.spawnYaw=Number(yaw.toFixed(3));
fs.writeFileSync(p,JSON.stringify(d,null,1),{encoding:'utf8'});
console.log('спавн  :',d.spawn.join(', '));
console.log('цель   :',tx,tz,'(стол)');
console.log('было   : -2.45  ->  стало:',d.spawnYaw);
