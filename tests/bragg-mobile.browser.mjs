import test from "node:test";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {webkit} from "playwright";
const root=resolve("static");
const types={".html":"text/html",".css":"text/css",".mjs":"text/javascript",".js":"text/javascript",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png"};
test("Bragg scan is visible and responsive at narrow and short iPhone viewports",async()=>{
  const server=createServer(async(req,res)=>{
    try{
      let path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
      if(!path.startsWith(root+sep))throw Error("Invalid path");
      if(path.endsWith(sep)||!extname(path))path=resolve(path,"index.html");
      const body=await readFile(path);
      res.writeHead(200,{"Content-Type":types[extname(path)]||"application/octet-stream"});res.end(body);
    }catch{res.writeHead(404);res.end();}
  });
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const browser=await webkit.launch();
  await mkdir("test-artifacts/bragg-mobile",{recursive:true});
  try{
    for(const [width,height] of [[320,568],[390,844],[430,932],[874,402]]){
      const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:3});
      try{
        const page=await context.newPage(),errors=[];
        page.on("pageerror",e=>errors.push(e.message));
        await page.goto("http://127.0.0.1:"+server.address().port+"/tools/bragg/");
        await page.locator("#scanPhasors .scan-contribution").first().waitFor();
        await page.evaluate(()=>document.fonts.ready);
        const stage=page.locator(".scan-vector-stage");
        await stage.evaluate(e=>e.scrollIntoView({block:"center"}));
        await page.screenshot({path:"test-artifacts/bragg-mobile/"+width+"x"+height+".png"});
        const bounds=await stage.evaluate(e=>{
          const rect=x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
          const svg=e.querySelector("#scanPhasors");
          const circle=svg.querySelector("circle");
          return {stage:rect(e),svg:rect(svg),circle:rect(circle),angle:rect(e.querySelector("#scanVectorAngle")),planes:rect(e.querySelector("#scanPlanes")),pageWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,viewportHeight:innerHeight};
        });
        const tag=width+"x"+height;
        assert.ok(bounds.pageWidth<=bounds.viewportWidth+1,tag+" horizontal page overflow");
        assert.ok(bounds.svg.width>=140&&Math.abs(bounds.svg.width-bounds.svg.height)<=1,tag+" square SVG");
        for(const key of ["svg","circle","angle","planes"]){
          const r=bounds[key];
          assert.ok(r.x>=-1&&r.right<=bounds.viewportWidth+1,tag+" "+key+" horizontal clipping");
          assert.ok(r.y>=-2&&r.bottom<=bounds.viewportHeight+2,tag+" "+key+" outside viewport");
        }
        assert.ok(bounds.circle.width>100,tag+" visible circle");
        const original=await page.locator("#scanPhasors").innerHTML();
        const slider=page.locator("#scanVectorAngle");
        const r=await slider.boundingBox();
        await page.touchscreen.tap(r.x+r.width*.65,r.y+r.height/2);
        assert.notEqual(await page.locator("#scanPhasors").innerHTML(),original,tag+" touch angle changes SVG");
        assert.equal(await slider.inputValue(),await page.locator("#scanTwoTheta").inputValue(),tag+" synchronized angles");
        const count=page.locator("#scanPlanes"),cr=await count.boundingBox();
        await page.touchscreen.tap(cr.x+cr.width*.9,cr.y+cr.height/2);
        const n=Number(await count.inputValue());
        assert.notEqual(n,8,tag+" touch changes plane count");
        assert.equal(await page.locator("#scanPhasors .scan-contribution").count(),n,tag+" vectors match plane count");
        assert.deepEqual(errors,[],tag+" browser errors");
        await page.screenshot({path:"test-artifacts/bragg-mobile/"+tag+"-adjusted.png"});
      }finally{await context.close()}
    }
  }finally{await browser.close();await new Promise(r=>server.close(r))}
});
