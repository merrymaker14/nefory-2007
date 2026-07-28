const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'assets','models','room_emo_colliders.json');
const d=JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
d.lightmaps       ={on:'room_lm_on.jpg',       off:'room_lm_off.jpg'};
d.lightmapsMobile ={on:'room_lm_on_2k.jpg',    off:'room_lm_off_2k.jpg'};
d.propmaps        ={on:'props_lm_on.jpg',      off:'props_lm_off.jpg'};
d.propmapsMobile  ={on:'props_lm_on_512.jpg',  off:'props_lm_off_512.jpg'};
d.propMesh='PROPS';                      // по этой строке в имени меша выбираем карту
fs.writeFileSync(p,JSON.stringify(d,null,1),{encoding:'utf8'});
console.log('комната :',d.lightmaps.on,'/',d.lightmapsMobile.on);
console.log('напитки :',d.propmaps.on,'/',d.propmapsMobile.on);
