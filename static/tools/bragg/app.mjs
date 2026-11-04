import { bragg, squareLatticeSpacing, VERSION } from "./model.mjs";

  const $=id=>document.getElementById(id);
  const number=id=>$(id).value.trim()===""?NaN:Number($(id).value);
  const fmt=x=>Number(x.toPrecision(7)).toString();
  let result=null, guided=true, latestPlane=null, previousGuided=null;

  function drawLattice(p){
    const {a,h,k,d}=p, step=a*8.6, cx=380,cy=203;
    const lines=[], thick=[],dots=[];
    for(let m=-42;m<=42;m++){
      const line=k===0
        ?`<line x1="${cx+m*step}" y1="49" x2="${cx+m*step}" y2="355"/>`
        :`<line x1="30" y1="${cy+m*step-(30-cx)}" x2="730" y2="${cy+m*step-(730-cx)}"/>`;
      (m===0||m===1?thick:lines).push(line);
    }
    for(let i=-28;i<=28;i++)for(let j=-28;j<=28;j++){
      const x=cx+i*step,y=cy+j*step;
      if(x>36&&x<724&&y>52&&y<350)dots.push(`<circle cx="${x}" cy="${y}" r="3"/>`);
    }
    const n=h*h+k*k,vx=h*step/n,vy=k*step/n;
    const labelX=cx+vx*.5, labelY=cy+vy*.5-14;
    $("latticeGeometry").innerHTML=`
      <defs>
        <clipPath id="braggLatticeClip"><rect x="35" y="50" width="690" height="303"/></clipPath>
        <marker id="braggDtip" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto">
          <path d="M0 0L6 3.5L0 7Z" fill="#9e382e"/>
        </marker>
      </defs>
      <rect x="35" y="50" width="690" height="303" rx="7" fill="#eff5fd" stroke="#d2deee"/>
      <g clip-path="url(#braggLatticeClip)">
        <g stroke="#9bb3ce" stroke-width="1.1" opacity=".48">${lines.join("")}</g>
        <g stroke="#9e382e" stroke-width="3.1">${thick.join("")}</g>
        <g fill="#084b9e">${dots.join("")}</g>
        <path d="M${cx} ${cy}L${cx+vx} ${cy+vy}" stroke="#9e382e" stroke-width="2.7" marker-end="url(#braggDtip)"/>
        <text x="${labelX}" y="${labelY}" font-family="system-ui,sans-serif" font-size="21" font-weight="700" text-anchor="middle" fill="#9e382e" stroke="#eff5fd" stroke-width="5" paint-order="stroke">d</text>
      </g>
      <rect x="45" y="61" width="340" height="57" rx="6" fill="#fff" opacity=".95"/>
      <g font-family="system-ui,sans-serif">
        <text x="57" y="84" font-weight="700" font-size="17" fill="#1c3049">Family (${h}${k}) · d = ${fmt(d)} Å</text>
        <text x="57" y="106" font-size="13" fill="#536c87">d = a / √(h² + k²) · a = ${fmt(a)} Å</text>
        <rect x="43" y="358" width="680" height="38" rx="4" fill="#fff" opacity=".95"/>
        <circle cx="62" cy="376" r="4" fill="#084b9e"/><text x="75" y="381" font-size="14" fill="#1c3049">Lattice points</text>
        <path d="M241 376H265" stroke="#9e382e" stroke-width="3"/><text x="279" y="381" font-size="14" fill="#1c3049">Selected planes &amp; spacing d</text>
      </g>`;
  }

  function drawRay(r){
    const svg=$("geometry"),status=$("ray-angle-display");
    if(!r){
      status.textContent="No Bragg angle at these inputs";
      svg.innerHTML=`
        <rect x="15" y="16" width="490" height="328" rx="9" fill="#f0f5fc" stroke="#d5e1f0"/>
        <path d="M28 190H491M28 266H491" stroke="#91a8c4" stroke-width="2.5"/>
        <path d="M471 190V266M465 190H477M465 266H477" stroke="#9e382e" stroke-width="2"/>
        <text x="480" y="232" font-size="18" fill="#9e382e" font-family="system-ui,sans-serif">d</text>
        <text x="260" y="125" text-anchor="middle" font-size="18" font-weight="700" fill="#9e382e" font-family="system-ui,sans-serif">No possible Bragg angle</text>
        <text x="260" y="149" text-anchor="middle" font-size="13" fill="#516d89" font-family="system-ui,sans-serif">For this plane family, nλ must be ≤ 2d.</text>`;
      return;
    }
    const theta=r.theta*Math.PI/180, cs=Math.cos(theta),sn=Math.sin(theta);
    const A={x:210,y:190},B={x:272,y:265},L=190;
    const inc=p=>`M${p.x-L*cs} ${p.y-L*sn} L${p.x} ${p.y}`;
    const out=p=>`M${p.x} ${p.y}L${p.x+L*cs} ${p.y-L*sn}`;
    const radius=68,rt=36;
    const thetaArc=`M${A.x+rt} ${A.y} A${rt} ${rt} 0 0 0 ${A.x+rt*cs} ${A.y-rt*sn}`;
    const twoArc=`M${A.x+radius*cs} ${A.y+radius*sn} A${radius} ${radius} 0 0 0 ${A.x+radius*cs} ${A.y-radius*sn}`;
    const labelThetaX=A.x+48*Math.cos(theta/2),labelThetaY=A.y-48*Math.sin(theta/2)-4;
    const diff=2*r.spacing*sn;
    status.textContent=`θ ${fmt(r.theta)}°  ·  2θ ${fmt(r.twoTheta)}°`;
    svg.innerHTML=`
      <defs>
        <marker id="braggBlueArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#084b9e"/></marker>
        <marker id="braggRedArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#9e382e"/></marker>
      </defs>
      <rect x="15" y="16" width="490" height="328" rx="9" fill="#f0f5fc" stroke="#d5e1f0"/>
      <path d="M27 ${A.y}H492 M27 ${B.y}H492" stroke="#90a8c4" stroke-width="2.4"/>
      <path d="M469 ${A.y}V${B.y}M463 ${A.y}H475 M463 ${B.y}H475" stroke="#9e382e" stroke-width="2"/>
      <text x="478" y="${(A.y+B.y)/2+5}" font-size="17" fill="#9e382e" font-family="system-ui,sans-serif">d</text>
      <g fill="none" stroke-width="3.6" stroke-linecap="round">
        <path d="${inc(A)}" stroke="#084b9e" marker-end="url(#braggBlueArrow)"/>
        <path d="${out(A)}" stroke="#9e382e" marker-end="url(#braggRedArrow)"/>
        <path d="${inc(B)}" stroke="#084b9e" opacity=".35"/>
        <path d="${out(B)}" stroke="#9e382e" opacity=".35"/>
      </g>
      <path d="M${A.x} ${A.y}L${A.x+145*cs} ${A.y+145*sn}" stroke="#657e99" stroke-width="1.5" stroke-dasharray="4 5"/>
      <path d="M${A.x} ${A.y}H${A.x+149}" stroke="#657e99" stroke-width="1.3" stroke-dasharray="4 5"/>
      <path d="${twoArc}" stroke="#9e382e" stroke-width="3.4" fill="none"/>
      <path d="${thetaArc}" stroke="#084b9e" stroke-width="2.5" fill="none"/>
      <g font-family="system-ui,sans-serif">
        <text x="${labelThetaX}" y="${labelThetaY}" font-size="17" font-weight="800" stroke="#f0f5fc" stroke-width="5" paint-order="stroke" fill="#084b9e">θ</text>
        <text x="${A.x+radius+14}" y="${A.y+5}" font-size="18" font-weight="800" stroke="#f0f5fc" stroke-width="5" paint-order="stroke" fill="#9e382e">2θ</text>
        <rect x="26" y="27" width="473" height="58" rx="5" fill="#fff" opacity=".95"/>
        <text x="39" y="49" font-size="15" font-weight="700" fill="#1c3049">Watch the red 2θ arc change</text>
        <text x="39" y="70" font-size="13" fill="#536e8a">θ = ${fmt(r.theta)}° to planes · 2θ = ${fmt(r.twoTheta)}° between beams</text>
        <rect x="27" y="306" width="474" height="29" rx="5" fill="#fff" opacity=".94"/>
        <text x="38" y="324" font-size="13" font-weight="700" fill="#1c3049">2d sinθ = ${fmt(diff)} Å = ${r.order}λ · in-phase condition</text>
      </g>`;
  }

  function update(){
    guided=!$("advancedPanel").open;
    $("guidedControls").hidden=!guided;
    $("experimentHelper").textContent=guided
      ?"Adjust the square lattice or switch plane families. The Bragg-angle arc changes alongside the lattice."
      :"Enter a known spacing, 2θ or q. Only the ray construction is shown: the numerical calculation is independent of the guided square lattice.";
    $("latticePane").hidden=!guided;
    $("diagramPair").classList.toggle("advanced-layout",!guided);
    $("value-label").textContent={
      spacing:"Plane spacing d (Å)",angle:"Diffraction angle 2θ (°)",q:"Scattering vector q (Å⁻¹)"
    }[$("mode").value];
    $("spacing-slider").hidden=$("mode").value!=="spacing";
    if($("mode").value==="spacing")$("spacing-slider").value=$("value").value;
    const lambda=number("wavelength");
    let plane=null;
    try{
      if(guided){
        const a=number("latticeA");
        if(a<2||a>12)throw Error("Choose a square-lattice parameter between 2 and 12 Å.");
        plane=squareLatticeSpacing({a,plane:$("planeFamily").value});
        latestPlane=plane;
        drawLattice(plane);
      }else latestPlane=null;
      result=bragg({
        mode:guided?"spacing":$("mode").value,
        value:guided?plane.d:number("value"),wavelength:lambda,
        order:guided?1:number("order")
      });
      $("error").textContent="";
      $("results").hidden=false;
      $("angle-out").textContent=fmt(result.twoTheta)+"°";
      $("theta-out").textContent=fmt(result.theta)+"°";
      $("d-out").textContent=fmt(result.spacing);
      $("q-out").textContent=fmt(result.q);
    }catch(e){
      result=null;
      $("error").textContent=e.message;
      $("results").hidden=!guided;
      $("angle-out").textContent="—";
      $("theta-out").textContent="—";
      $("d-out").textContent=plane?fmt(plane.d):"—";
      $("q-out").textContent="—";
      latestPlane=plane;
    }
    if(guided&&plane){
      $("takeawayTitle").textContent=result?"What changed — and why?":"No possible first-order Bragg angle";
      if(result){
        const now={a:plane.a,plane:plane.plane,lambda,angle:result.twoTheta,d:result.spacing};
        let message="Move the lattice slider or change plane families. Watch both the red plane-spacing arrow and the red 2θ arc.";
        if(previousGuided&&previousGuided.lambda===lambda&&previousGuided.plane===plane.plane&&previousGuided.a!==now.a){
          message=now.a>previousGuided.a?
            `You increased a, so d grew and 2θ decreased from ${fmt(previousGuided.angle)}° to ${fmt(now.angle)}°.`
            :`You decreased a, so d shrank and 2θ increased from ${fmt(previousGuided.angle)}° to ${fmt(now.angle)}°.`;
        }else if(previousGuided&&previousGuided.a===now.a&&previousGuided.lambda===lambda&&previousGuided.plane!==now.plane){
          message=`Switching from (${previousGuided.plane}) to (${now.plane}) changed d from ${fmt(previousGuided.d)} to ${fmt(now.d)} Å, shifting 2θ from ${fmt(previousGuided.angle)}° to ${fmt(now.angle)}°.`;
        }else if(previousGuided&&previousGuided.a===now.a&&previousGuided.plane===now.plane&&previousGuided.lambda!==lambda){
          message=now.lambda>previousGuided.lambda?
            "At the same plane spacing, a longer wavelength requires a larger Bragg angle.":
            "At the same plane spacing, a shorter wavelength requires a smaller Bragg angle.";
        }
        $("observation").textContent=`${message} Current (${plane.plane}) family: d = ${fmt(plane.d)} Å, θ = ${fmt(result.theta)}°, 2θ = ${fmt(result.twoTheta)}°.`;
        previousGuided=now;
      }else{
        $("observation").textContent=`The (${plane.plane}) planes are ${fmt(plane.d)} Å apart, but nλ ≤ 2d is not satisfied. No possible first-order reflection angle is shown.`;
      }
      $("explanation").textContent="This is a 2D lattice teaching model. The highlighted lines represent plane families, not actual mirrored surfaces. Bragg's law does not predict intensities or a complete PXRD pattern.";
    }else{
      $("takeawayTitle").textContent="Advanced calculation";
      $("observation").textContent=result?
        `For d = ${fmt(result.spacing)} Å, order n = ${result.order}, and λ = ${fmt(result.wavelength)} Å, the condition occurs at θ = ${fmt(result.theta)}° and 2θ = ${fmt(result.twoTheta)}°.`
        :"Choose physically allowed inputs; no diffraction angle is calculated for this combination.";
      $("explanation").textContent="Advanced spacing, 2θ and q inputs are not attached to the schematic square lattice. Reflection intensities and structural absences are outside this model.";
    }
    drawRay(result);
    $("export").disabled=!result;
  }

  for(const id of ["value","wavelength","order"]){
    $(id).addEventListener("input",()=>{
      if(id==="wavelength")$("preset").value="custom";
      update();
    });
  }
  for(const id of ["latticeA","planeFamily"]){
    $(id).addEventListener("input",()=>{
      if(id==="latticeA")$("latticeSlider").value=$("latticeA").value;
      update();
    });
  }
  $("latticeSlider").addEventListener("input",()=>{
    $("latticeA").value=$("latticeSlider").value;
    update();
  });
  $("advancedPanel").addEventListener("toggle",update);
  $("mode").addEventListener("change",()=>{
    $("value").value={
      spacing:result?.spacing??3,
      angle:result?.twoTheta??30,
      q:result?.q??2
    }[$("mode").value];
    update();
  });
  $("spacing-slider").addEventListener("input",()=>{
    $("value").value=$("spacing-slider").value;
    update();
  });
  $("preset").addEventListener("change",()=>{
    if($("preset").value!=="custom")$("wavelength").value=$("preset").value;
    update();
  });
  $("reset").addEventListener("click",()=>{
    $("advancedPanel").open=false;
    $("mode").value="spacing";$("value").value=3;
    $("latticeA").value=4;$("latticeSlider").value=4;$("planeFamily").value="10";
    $("wavelength").value=1.5406;$("preset").value="1.5406";$("order").value=1;
    previousGuided=null;update();
  });
  $("export").addEventListener("click",()=>{
    if(!result)return;
    const record={
      tool:"Frameworked Bragg explorer",version:VERSION,
      units:{spacing:"Å",wavelength:"Å",angles:"degrees",q:"Å^-1"},
      ...result,
      model:"Geometric Bragg diffraction condition, not intensity or structure factor",
      guidedSquareLattice:guided&&latestPlane?
        {aAngstrom:latestPlane.a,planeFamily:latestPlane.plane,h:latestPlane.h,k:latestPlane.k}:null
    };
    const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:"application/json"}));
    const a=document.createElement("a");
    a.href=url;a.download="bragg-calculation.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  update();

