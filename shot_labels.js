const {chromium}=require('playwright');const path=require('path');
const BASE=process.env.BASE||'http://localhost:8123/src/';
const SHOTS=[
 {n:'lbl_blazar', cam:'1.02,0.46,0.86', look:'0.52,0.22,0.50', fov:38},
 {n:'lbl_jaguar', cam:'0.28,1.12,-0.72', look:'0.62,0.90,-1.56', fov:42},
];
(async()=>{
 const b=await chromium.launch({args:['--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1100,height:760}});
 for(const s of SHOTS){
  await p.goto(`${BASE}?shot=1&cam=${s.cam}&look=${s.look}&monitor=0&light=1&fov=${s.fov}`,{waitUntil:'load',timeout:90000});
  await p.waitForFunction('window.__sceneReady===true',null,{timeout:90000});
  await p.waitForTimeout(500);
  await p.screenshot({path:path.join(__dirname,'renders','web',s.n+'.png')});
  console.log(s.n,'ок');
 }
 await b.close();
})();
