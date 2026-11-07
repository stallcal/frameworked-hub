const atoms=JSON.parse(document.querySelector('#data').textContent);
const byId=id=>document.getElementById(id), svg=byId('structure');
const centers=[];
for(const x of [.25,.75])for(const y of [.25,.75])for(const z of [.25,.75])centers.push([x,y,z]);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const relative=(a,b)=>a.map((v,i)=>v-b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const colors={C:'#404040',Zn:'#084b9e',O:'#9e382e'};
let mode='cell', center=centers[0], direction=0, sign=1;
function isCore(element,offset){
 return element==='Zn'||(element==='O'&&Math.hypot(...offset)<.008);
}
function classify(element,pos){
 const origin=centers.reduce((best,c)=>distance(c,pos)<distance(best,pos)?c:best,centers[0]);
 const offset=relative(pos,origin);
 const axis=offset.map(Math.abs).indexOf(Math.max(...offset.map(Math.abs)));
 return {origin,axis,side:Math.sign(offset[axis]),core:isCore(element,offset)};
}
function showKey(mode){
 const items=mode==='net'?[['Central cluster node','#9e382e'],['Connections to neighbors','#084b9e']]:
 mode==='linker'?[['Selected linker','#087e48'],['Unselected atoms','#adbdc9']]:
 [['Zn','#084b9e'],['O','#9e382e'],['C','#404040']];
 const key=byId('key');key.replaceChildren();
 for(const [label,color] of items){
  const entry=document.createElement('span'),swatch=document.createElement('span');
  entry.className='node-key-entry';swatch.className='node-key-swatch';swatch.style.backgroundColor=color;
  swatch.setAttribute('aria-hidden','true');
  entry.append(swatch,document.createTextNode(label));key.append(entry);
 }
}
function select(kind,origin=center,axis=0,side=1){
 mode=kind;center=origin;direction=axis;sign=side;
 byId('net').disabled=mode==='net';
 const content={
 cell:['MOF-5 unit cell','Zn₄O clusters are joined by terephthalate linkers. Select a group or change the view to see how those connections form a network.'],
 cluster:['Six linkers around a node','The blue zinc atoms surround a central oxygen. Six terephthalate linkers extend from this Zn₄O cluster toward six neighboring clusters. Follow each arm to its neighbor.'],
 linker:['One organic bridge','The highlighted terephthalate linker has a benzene ring and two carboxylate ends. Each end binds a different zinc cluster, so this linker becomes one edge of the net.'],
 net:['Primitive cubic net','Each dot represents a whole Zn₄O node; each edge represents one terephthalate bridge. Six edges meet the central node along three axes, giving the framework its primitive cubic connectivity.']
 };
 byId('sceneTitle').textContent=content[mode][0];byId('nodeResult').textContent=content[mode][1];
 showKey(mode);
 draw();
}
function collectAtoms(){
 const items=[];
 for(const [element,...original] of atoms){
  const pick=classify(element,original);
  if(mode==='cell'){
   items.push({element,pos:relative(original,[.5,.5,.5]),pick});continue;
  }
  // Rebuild the first coordination shell through the periodic cell faces.
  for(const tx of [-1,0,1])for(const ty of [-1,0,1])for(const tz of [-1,0,1]){
   const pos=relative(original.map((v,i)=>v+[tx,ty,tz][i]),center);
   const extent=pos.map(Math.abs).sort((a,b)=>b-a);
   if(extent[0]>.552||extent[1]>.083)continue;
   const hub=pos.map(v=>Math.round(v*2)/2);
   if(extent[0]>.443&&!isCore(element,relative(pos,hub)))continue;
   const active=extent[0]<.5&&Math.sign(pos[direction])===sign&&Math.abs(pos[direction])===extent[0]&&!isCore(element,relative(pos,hub));
   items.push({element,pos,pick,active});
  }
 }
 return items;
}
function element(tag,attributes){
 const e=document.createElementNS(svg.namespaceURI,tag);
 for(const [k,v] of Object.entries(attributes))e.setAttribute(k,v);
 return e;
}
function draw(){
 const theta=Number(byId('angle').value)*Math.PI/180;
 const factor=mode==='cell'?208:mode==='net'?188:255;
 function project([x,y,z]){
  const horizontal=x*Math.cos(theta)-z*Math.sin(theta),depth=x*Math.sin(theta)+z*Math.cos(theta);
  return [230+factor*horizontal,178+factor*(.40*depth-.9165*y),.9165*depth+.40*y];
 }
 const shapes=[];
 function line(a,b,color,width){
  const [x1,y1,z1]=project(a),[x2,y2,z2]=project(b);
  shapes.push([(z1+z2)/2-.002,element('line',{x1,y1,x2,y2,stroke:color,'stroke-width':width})]);
 }
 function dot(pos,color,r,pick){
  const [cx,cy,z]=project(pos),n=element('circle',{cx,cy,r,fill:color});
  if(pick){n.dataset.pick='true';n.onclick=()=>select(pick.core?'cluster':'linker',pick.origin,pick.axis,pick.side)}
  shapes.push([z,n]);
 }
 if(mode==='net'){
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
   const a=[x,y,z],central=a.every(v=>v===0);
   for(let axis=0;axis<3;axis++){if(a[axis]===1)continue;const b=[...a];b[axis]++;
    const near=central||b.every(v=>v===0);line(scale(a,.5),scale(b,.5),near?'#084b9e':'#bac9d8',near?4:1.4)}
   dot(scale(a,.5),central?'#9e382e':'#52677b',central?8:4);
  }
 }else{
  const points=collectAtoms();
  for(let i=0;i<points.length;i++){
   const a=points[i];
   for(let j=0;j<i;j++){
    const b=points[j],pair=[a.element,b.element].sort().join('-');
    const cutoff={'C-C':1.65,'C-O':1.55,'O-Zn':2.25}[pair];
    if(cutoff&&distance(a.pos,b.pos)*25.86584<cutoff)line(a.pos,b.pos,a.active&&b.active&&mode==='linker'?'#087e48':'#98aaba',1.7);
   }
   let color=colors[a.element];if(mode==='linker')color=a.active?'#087e48':'#adbdc9';
   dot(a.pos,color,a.element==='Zn'?4.8:a.element==='O'?3.2:2.7,mode==='cell'?a.pick:null);
  }
 }
 svg.replaceChildren(...shapes.sort((a,b)=>a[0]-b[0]).map(pair=>pair[1]));
}
byId('cluster').onclick=()=>select('cluster');byId('linker').onclick=()=>select('linker');
byId('net').onclick=()=>select('net');byId('reset').onclick=()=>select('cell');
byId('angle').oninput=draw;showKey(mode);draw();
