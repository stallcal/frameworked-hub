const el=id=>document.getElementById(id);
const curves=JSON.parse(el('data').textContent);
const colors=['#084b9e','#9e382e'];
const names=['first','second'];
for(const id of names)curves.forEach((c,i)=>el(id).add(new Option(c.name,i)));
el('first').value=curves.findIndex(c=>c.name==='Ni2(dobdc)');
el('second').value=curves.findIndex(c=>c.name==='HKUST-1');
function uptake(points,p){
  const i=points.findIndex(([x])=>x>=p);
  if(i<0||p<points[0][0])throw Error('Pressure outside experiment');
  const [x,y]=points[i];if(x===p)return y;
  const [a,b]=points[i-1];return b+(p-a)*(y-b)/(x-a);
}
const svg=el('chart');
function mark(tag,attrs,text){
 const n=document.createElementNS(svg.namespaceURI,tag);
 for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);
 if(text!==undefined)n.textContent=text;svg.append(n);
}
function draw(){
 const selected=names.map(id=>curves[Number(el(id).value)]);
 for(const [i,id] of names.entries())for(const opt of el(id).options)opt.disabled=opt.value===el(names[1-i]).value;
 const fill=Number(el('fill').value);
 el('release').max=fill-1;
 const release=Number(el('release').value);
 el('fillValue').value=fill+' bar';el('releaseValue').value=release+' bar';
 const X=x=>65+x*4.52,Y=y=>261-y*.76;
 svg.replaceChildren();
 mark('rect',{x:X(release),y:33,width:X(fill)-X(release),height:228,fill:'#dce7ef'});
 for(const y of [0,100,200,300]){
  mark('line',{x1:X(0),x2:X(100),y1:Y(y),y2:Y(y),stroke:'#a9bdcf'});
  mark('text',{x:57,y:Y(y)+5,'text-anchor':'end'},y);
 }
 for(const x of [0,25,50,75,100])mark('text',{x:X(x),y:285,'text-anchor':'middle'},x);
 mark('text',{x:286,y:313,'text-anchor':'middle'},'Pressure (bar)');
 mark('text',{transform:'translate(17 150) rotate(-90)','text-anchor':'middle'},'CH₄ uptake (cm³ STP/cm³)');
 for(const p of [release,fill])mark('line',{x1:X(p),x2:X(p),y1:33,y2:261,stroke:'#41556c','stroke-dasharray':'3 4'});
 el('capacity').replaceChildren();
 const delivered=[];
 selected.forEach((curve,i)=>{
  mark('polyline',{points:curve.points.map(([p,q])=>[X(p),Y(q)].join(',')).join(' '),fill:'none',stroke:colors[i],'stroke-width':2.5,'stroke-dasharray':i?'7 4':'none'});
  for(const [p,q] of curve.points)mark('circle',{cx:X(p),cy:Y(q),r:2,fill:colors[i]});
  const high=uptake(curve.points,fill),low=uptake(curve.points,release);
  for(const [p,q] of [[fill,high],[release,low]])mark('circle',{cx:X(p),cy:Y(q),r:5,stroke:colors[i],fill:'white','stroke-width':2});
  const row=el('capacity').insertRow(),th=document.createElement('th');th.scope='row';th.className='gas-name '+(i===0?'gas-name-blue':'gas-name-red');th.textContent=curve.name;row.append(th);
  for(const v of [high,low,high-low])row.insertCell().textContent=v.toFixed(1);
  delivered.push(high-low);
 });
 const legend=el('legend');legend.replaceChildren();selected.forEach((curve,i)=>{const item=document.createElement('span'),swatch=document.createElement('span');item.className='mof-legend-entry';swatch.className='mof-legend-swatch '+(i===0?'mof-legend-blue':'mof-legend-red');swatch.setAttribute('aria-hidden','true');item.append(swatch,document.createTextNode(curve.name+' ('+(i===0?'solid':'dashed')+')'));legend.append(item);});
 const delta=delivered[0]-delivered[1];
 el('finding').textContent=Math.abs(delta)<0.1?'The estimated deliveries agree within 0.1 cm³(STP)/cm³.':selected[delta>0?0:1].name+' delivers about '+Math.abs(delta).toFixed(1)+' more cm³(STP) of methane per cm³ of crystal over the '+fill+' → '+release+' bar swing.';
 el('finding').textContent+=' A material can hold more at fill pressure yet deliver less if it also retains more at delivery pressure. Move either endpoint to see that difference change.';
}
for(const c of curves){const a=document.createElement('a');a.href=c.url;a.textContent=c.name+' data';el('sources').append(a,' · ')}
for(const id of [...names,'fill','release'])el(id).addEventListener('input',draw);
draw();
