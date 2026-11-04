import { bragg, squareLatticeSpacing, VERSION } from "./model.mjs";
const $ = (id) => document.getElementById(id),
  number = (id) => ($(id).value.trim() === "" ? NaN : Number($(id).value));
const fmt = (x) => Number(x.toPrecision(7)).toString();

let result;
let guided = true;
let latticeView = true;
let latestPlane = null;
function svgPlaneLine(h,k,m,step,cx,cy){
  if(k===0){
    const x=cx+m*step;
    return `<line x1="${x}" y1="49" x2="${x}" y2="355" />`;
  }
  const x1=30,x2=730;
  const y1=cy+m*step-h*(x1-cx)/k,y2=cy+m*step-h*(x2-cx)/k;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
}
function renderLattice({a,h,k,d,plane}){
  const cx=380,cy=203,step=a*8.6;
  let dots="",guides="",highlight="";
  for(let i=-22;i<=22;i++)for(let j=-22;j<=22;j++){
    const x=cx+i*step,y=cy+j*step;
    if(x>37&&x<723&&y>53&&y<350) dots+=`<circle cx="${x}" cy="${y}" r="3" />`;
  }
  for(let m=-40;m<=40;m++){
    const line=svgPlaneLine(h,k,m,step,cx,cy);
    if(m===0||m===1)highlight+=line;else guides+=line;
  }
  const n=h*h+k*k;
  const vx=h*step/n,vy=k*step/n;
  const midX=cx+vx*.5,midY=cy+vy*.5;
  $("latticeGeometry").innerHTML=`
    <defs>
      <clipPath id="latticePlotClip"><rect x="35" y="50" width="690" height="303"/></clipPath>
      <marker id="latticeSpacingTip" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <path d="M0 0 L6 3.5 L0 7Z" fill="#9e382e"/>
      </marker>
    </defs>
    <rect x="35" y="50" width="690" height="303" rx="7" fill="#eff5fd" stroke="#d2deee"/>
    <g clip-path="url(#latticePlotClip)">
      <g stroke="#9bb3ce" stroke-width="1.15" opacity=".48">${guides}</g>
      <g stroke="#9e382e" stroke-width="3.1" opacity=".94">${highlight}</g>
      <g fill="#084b9e">${dots}</g>
      <line x1="${cx}" y1="${cy}" x2="${cx+vx}" y2="${cy+vy}"
        stroke="#9e382e" stroke-width="2.3" marker-end="url(#latticeSpacingTip)"/>
    </g>
    <rect x="47" y="61" width="255" height="38" rx="5" fill="#ffffff" opacity=".92"/>
    <text x="58" y="85" font-family="system-ui,sans-serif" font-weight="700" font-size="17" fill="#1c3049">
      Family (${h}${k}) · d = ${fmt(d)} Å
    </text>
    <rect x="44" y="355" width="670" height="40" fill="#ffffff" opacity=".92"/>
    <circle cx="67" cy="377" r="4" fill="#084b9e"/>
    <text x="81" y="381" font-family="system-ui,sans-serif" font-size="14" fill="#1c3049">Lattice points</text>
    <path d="M245 377H270" stroke="#9e382e" stroke-width="3"/>
    <text x="284" y="381" font-family="system-ui,sans-serif" font-size="14" fill="#1c3049">Selected plane family</text>
    <text x="560" y="381" font-family="system-ui,sans-serif" font-size="13" fill="#566e88">2D schematic</text>`;
}
function renderRayDiagram(r){
  if(!r){
    $("geometry").innerHTML='<text x="65" y="200" font-size="22" font-family="sans-serif" fill="#9e382e">No Bragg angle under these inputs.</text>';
    return;
  }
  const angle=r.theta*Math.PI/180,cx=320,y=180;
  const gap=90,length=185;
  const path=(yy,color)=>`<path d="M${cx-length*Math.cos(angle)} ${yy-length*Math.sin(angle)} L${cx} ${yy} L${cx+length*Math.cos(angle)} ${yy-length*Math.sin(angle)}"
  fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
  $("geometry").innerHTML=`
    <g stroke="#839bb9" stroke-width="2.3"><path d="M45 ${y}H715 M45 ${y+gap}H715"/></g>
    ${path(y,"#084b9e")}${path(y+gap,"#9e382e")}
    <path d="M630 ${y}V${y+gap} M624 ${y}H636 M624 ${y+gap}H636" stroke="#1c3049" stroke-width="2"/>
    <g font-family="system-ui,sans-serif" fill="#1c3049">
      <text x="42" y="42" font-size="20" font-weight="700">Bragg ray construction</text>
      <text x="42" y="73" font-size="16">θ = ${fmt(r.theta)}° · diffraction 2θ = ${fmt(r.twoTheta)}°</text>
      <text x="646" y="${y+gap/2+6}" font-size="18">d</text>
      <text x="43" y="379" font-size="14">Planes are rotated horizontally for illustration; not atomic mirrors.</text>
    </g>`;
}
function updateFigureView(){
  const show=guided&&latticeView;
  $("latticeView").disabled=!guided;
  $("latticeGeometry").hidden=!show;
  $("geometry").hidden=show;
  $("latticeView").classList.toggle("selected",show);
  $("latticeView").setAttribute("aria-pressed",String(show));
  $("rayView").classList.toggle("selected",!show);
  $("rayView").setAttribute("aria-pressed",String(!show));
  $("figure-caption").textContent=show
    ? "Dots represent repeating lattice points, not individual atoms. Highlighted lines show the chosen 2D plane family; distances change with a."
    : "The same plane family is rotated horizontally to illustrate the Bragg angle. This is a path-difference construction, not literal reflection from atomic mirrors.";
}
function update(){
  guided=!$("advancedPanel").open;
  $("guidedControls").hidden=!guided;
  $("value-label").textContent={
    spacing:"Plane spacing d (Å)",
    angle:"Diffraction angle 2θ (°)",
    q:"Scattering vector q (Å⁻¹)"
  }[$("mode").value];
  $("spacing-slider").hidden=$("mode").value!=="spacing";
  if($("mode").value==="spacing")$("spacing-slider").value=$("value").value;
  let plane=null;
  let wavelength=number("wavelength");
  try{
    if(guided){
      const a=number("latticeA");
      if(a<2||a>12)throw Error("Use a lattice parameter from 2 to 12 Å for this activity.");
      plane=squareLatticeSpacing({a,plane:$("planeFamily").value});
      latestPlane=plane;
      renderLattice(plane);
    }else latestPlane=null;
    result=bragg({
      mode:guided?"spacing":$("mode").value,
      value:guided?plane.d:number("value"),
      wavelength,order:guided?1:number("order")
    });
    $("error").textContent="";
    $("results").hidden=false;
    $("angle-out").textContent=fmt(result.twoTheta);
    $("d-out").textContent=fmt(result.spacing);
    $("q-out").textContent=fmt(result.q);
  }catch(e){
    result=null;
    $("error").textContent=e.message;
    $("results").hidden=!guided;
    $("angle-out").textContent="—";
    $("d-out").textContent=plane?fmt(plane.d):"—";
    $("q-out").textContent=plane?fmt(2*Math.PI/plane.d):"—";
    latestPlane=plane;
  }
  if(guided && plane){
    $("takeawayTitle").textContent=plane.plane==="10"?"Begin with the (10) planes":"Now compare the diagonal (11) planes";
    $("observation").textContent=result
      ? `For a = ${fmt(plane.a)} Å, the (${plane.h}${plane.k}) plane spacing is d = ${fmt(plane.d)} Å. With λ = ${fmt(wavelength)} Å, first-order constructive interference is possible at 2θ = ${fmt(result.twoTheta)}°. Switch families or adjust a to compare.`
      : `The highlighted planes are d = ${fmt(plane.d)} Å apart. The chosen wavelength is too long for a first-order Bragg angle (λ must be no greater than 2d). Try a shorter wavelength or larger lattice parameter.`;
    $("explanation").textContent="The diagram shows lattice geometry. It does not predict diffraction peak intensity, structure factors, or a complete PXRD pattern.";
  }else{
    $("takeawayTitle").textContent="Advanced calculation";
    $("observation").textContent=result
      ? `At d = ${fmt(result.spacing)} Å, the Bragg condition is satisfied at 2θ = ${fmt(result.twoTheta)}° for order n = ${result.order}.`
      : "Check the inputs. No valid diffraction condition was calculated.";
    $("explanation").textContent="Advanced inputs invert the same Bragg relation; they do not establish whether a measurable reflection will appear.";
  }
  renderRayDiagram(result);
  $("export").disabled=!result;
  updateFigureView();
}
for (const id of ["value", "wavelength", "order"])
  $(id).addEventListener("input", () => {
    if (id === "wavelength") $("preset").value = "custom";
    update();
  });
for(const id of ["latticeA","planeFamily"])$(id).addEventListener("input",()=>{
  if(id==="latticeA")$("latticeSlider").value=$("latticeA").value;
  update();
});
$("latticeSlider").addEventListener("input",()=>{
  $("latticeA").value=$("latticeSlider").value;
  update();
});
$("advancedPanel").addEventListener("toggle",update);
$("latticeView").addEventListener("click",()=>{latticeView=true;updateFigureView();});
$("rayView").addEventListener("click",()=>{latticeView=false;updateFigureView();});
$("mode").addEventListener("change", () => {
  $("value").value = {
    spacing: result?.spacing ?? 3,
    angle: result?.twoTheta ?? 30,
    q: result?.q ?? 2,
  }[$("mode").value];
  update();
});
$("spacing-slider").addEventListener("input", () => {
  $("value").value = $("spacing-slider").value;
  update();
});
$("preset").addEventListener("change", () => {
  if ($("preset").value !== "custom") $("wavelength").value = $("preset").value;
  update();
});
$("reset").addEventListener("click", () => {
  $("advancedPanel").open=false;
  $("mode").value="spacing";
  $("value").value=3;
  $("latticeA").value=4;$("latticeSlider").value=4;
  $("planeFamily").value="10";
  $("wavelength").value=1.5406;
  $("preset").value="1.5406";
  $("order").value=1;
  latticeView=true;
  update();
});
$("export").addEventListener("click", () => {
  if (!result) return;
  const a = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              tool: "Frameworked Bragg explorer",
              version: VERSION,
              units: {
                spacing: "Å",
                wavelength: "Å",
                angles: "degrees",
                q: "Å^-1",
              },
              ...result,
              model:
                "Bragg geometry; no intensity or structure-factor prediction",
              guidedSquareLattice: guided && latestPlane ? {aAngstrom:latestPlane.a,planeFamily:latestPlane.plane,h:latestPlane.h,k:latestPlane.k} : null,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
  a.href = url;
  a.download = "bragg-calculation.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
update();
