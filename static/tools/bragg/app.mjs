import { bragg, squareLatticeSpacing, compareTwoPlaneInterference, VERSION } from "./model.mjs";

  const $=id=>document.getElementById(id);
  const number=id=>$(id).value.trim()===""?NaN:Number($(id).value);
  const fmt=x=>Number(x.toFixed(2)).toFixed(2);
  const fmtPath=x=>Number(x.toFixed(4)).toString();
  let result=null, guided=true, latestPlane=null, previousGuided=null, previousLatticeA=null;

  function drawLattice(p){
    const {a,h,k,d}=p, step=a*8.6, cx=380,cy=203;
    const lines=[], thick=[], dots=[], previousDots=[];
    const oldStep=previousLatticeA!==null && previousLatticeA!==a?previousLatticeA*8.6:null;
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
    // Ghost only a small central group of PREVIOUS positions, so motion is visible
    // without distracting from the current diagram or leaving permanent overlays.
    if(oldStep!==null){
      for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++){
        const x=cx+i*oldStep,y=cy+j*oldStep;
        if(x>36&&x<724&&y>52&&y<350)
          previousDots.push(`<circle class="lattice-previous-dot" cx="${x}" cy="${y}" r="3.4"/>`);
      }
    }
    const aX1=cx+step,aX2=cx+2*step,aBracketY=cy+51;
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
        <g class="lattice-previous-positions" fill="none" stroke="#084b9e" stroke-width="1.7">${previousDots.join("")}</g>
        <g fill="#084b9e">${dots.join("")}</g>
        <path d="M${cx} ${cy}L${cx+vx} ${cy+vy}" stroke="#9e382e" stroke-width="2.7" marker-end="url(#braggDtip)"/>
        <text x="${labelX}" y="${labelY}" font-family="system-ui,sans-serif" font-size="21" font-weight="700" text-anchor="middle" fill="#9e382e" stroke="#eff5fd" stroke-width="5" paint-order="stroke">d</text>
        <!-- a is measured horizontally between two actual neighboring lattice points. -->
        <g class="lattice-a-bracket" data-distance-px="${step}" stroke="#084b9e" fill="none" stroke-linecap="round">
          <path d="M${aX1} ${cy+5}V${aBracketY-8} M${aX2} ${cy+5}V${aBracketY-8}" stroke-width="1.25" stroke-dasharray="3 3" opacity=".8"/>
          <path d="M${aX1} ${aBracketY-7}V${aBracketY+7} M${aX1} ${aBracketY}H${aX2} M${aX2} ${aBracketY-7}V${aBracketY+7}" stroke-width="2.5"/>
        </g>
        <text class="lattice-a-label" x="${(aX1+aX2)/2}" y="${aBracketY-13}" font-family="system-ui,sans-serif" font-size="21" font-weight="700" text-anchor="middle" fill="#084b9e" stroke="#eff5fd" stroke-width="5" paint-order="stroke">a</text>
      </g>
      <rect x="45" y="61" width="340" height="57" rx="6" fill="#fff" opacity=".95"/>
      <g font-family="system-ui,sans-serif">
        <text x="57" y="84" font-weight="700" font-size="17" fill="#1c3049">Family (${h}${k}) · d = ${fmt(d)} Å</text>
        <text x="57" y="106" font-size="13" fill="#536c87">d = a / √(h² + k²) · a = ${fmt(a)} Å</text>
        <rect x="43" y="358" width="680" height="38" rx="4" fill="#fff" opacity=".95"/>
        <circle cx="62" cy="376" r="4" fill="#084b9e"/><text x="75" y="381" font-size="14" fill="#1c3049">Lattice points</text>
        <path d="M241 376H265" stroke="#9e382e" stroke-width="3"/><text x="279" y="381" font-size="14" fill="#1c3049">Selected planes &amp; spacing d</text>
      </g>`;
    previousLatticeA=a;
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

      </g>`;
  }


  function wavePath(base,fn){
    const pts=[];
    for(let i=0;i<=140;i++){
      const q=i/140, x=38+q*342;
      pts.push((i===0?"M":"L")+x.toFixed(2)+" "+(base-fn(2*Math.PI*3.15*q)).toFixed(2));
    }
    return pts.join(" ");
  }
  function drawWavePair(id,phase){
    // Two equal-amplitude contributions: resultant is the field sum, not PXRD intensity.
    const w1=wavePath(79,t=>18*Math.sin(t));
    const w2=wavePath(79,t=>18*Math.sin(t-phase));
    const sum=wavePath(169,t=>16*(Math.sin(t)+Math.sin(t-phase)));
    $(id).innerHTML=`
      <rect x="9" y="8" width="402" height="208" rx="8" fill="#f5f8fc"/>
      <path d="M36 79H384 M36 169H384" stroke="#c5d3e3" stroke-width="1.3" stroke-dasharray="4 5"/>
      <path d="${w1}" stroke="#084b9e" stroke-width="2.4" fill="none"/>
      <path d="${w2}" stroke="#9e382e" stroke-width="2.1" stroke-dasharray="5 3" fill="none"/>
      <path d="${sum}" stroke="#1c3049" stroke-width="3.1" fill="none"/>
      <g font-family="system-ui,sans-serif">
        <text x="30" y="30" font-weight="700" font-size="12" fill="#084b9e">Wave 1</text>
        <text x="108" y="30" font-weight="700" font-size="12" fill="#9e382e">Wave 2</text>
        <text x="31" y="120" font-weight="700" font-size="12" fill="#1c3049">Resulting wave = wave 1 + wave 2</text>
        <text x="31" y="204" font-size="11.5" fill="#58728e">${Math.abs(phase)<0.1?"Same phase: amplitudes add":"Half-cycle offset: equal amplitudes cancel"}</text>
      </g>`;
  }
  function drawInterference(r){
    $("interferenceComparison").hidden=!r;
    if(!r)return;
    const c=compareTwoPlaneInterference({spacing:r.spacing,wavelength:r.wavelength,order:r.order});
    drawWavePair("constructiveWaves",c.on.relativePhase);
    drawWavePair("destructiveWaves",c.off.relativePhase);
    $("onBraggAngle").textContent="2θ = "+fmt(c.on.twoTheta)+"°";
    $("offBraggAngle").textContent="2θ = "+fmt(c.off.twoTheta)+"°";
    $("onBraggPath").textContent="Δpath = "+fmtPath(c.on.pathDifference)+" Å = "+c.order+"λ";
    $("offBraggPath").textContent="Δpath = "+fmtPath(c.off.pathDifference)+" Å = ("+c.order+" − ½)λ";
  }
  function update(){
    guided=!$("advancedPanel").open;
    $("guidedControls").hidden=!guided;
    // The physical sliders live beside the diagrams; exact numeric fields stay in the sidebar.
    const aInput=number("latticeA");
    $("latticeSliderValue").textContent=Number.isFinite(aInput)?fmt(aInput)+" Å":"Enter a value";
    $("latticeSliderControl").hidden=!guided;
    $("qMetric").hidden=guided;
    $("readouts").classList.toggle("advanced-readouts",!guided);
    $("experimentHelper").textContent=guided
      ?"Move the lattice slider or choose a different plane family."
      :"Enter a known d-spacing, measured 2θ, or q. These advanced inputs are independent of the square-lattice example.";
    const guides={
      spacing:["Known spacing → possible peak position","Enter d to find where this plane spacing may satisfy the Bragg condition for your X-ray wavelength."],
      angle:["Measured peak → estimated plane spacing","Enter an experimental 2θ position and known wavelength to calculate the associated d-spacing. This alone does not index or identify the reflection."],
      q:["Scattering vector → plane spacing","Enter q to convert a scattering-vector magnitude into the corresponding spacing for the selected diffraction order."]
    };
    const topic=guides[$("mode").value];
    $("advancedQuestion").textContent=topic[0];
    $("advancedAnswer").textContent=topic[1];
    $("latticePane").hidden=!guided;
    $("latticeDetails").hidden=!guided;
    $("diagramPair").classList.toggle("advanced-layout",!guided);
    $("value-label").textContent={
      spacing:"Plane spacing d (Å)",angle:"Diffraction angle 2θ (°)",q:"Scattering vector q (Å⁻¹)"
    }[$("mode").value];
    const spacingSliderActive=!guided&&$("mode").value==="spacing";
    $("advancedSliderControl").hidden=!spacingSliderActive;
    $("spacing-slider").hidden=!spacingSliderActive;
    if($("mode").value==="spacing"){
      const dInput=number("value");
      $("advancedSliderValue").textContent=Number.isFinite(dInput)?fmt(dInput)+" Å":"Enter a value";
      if(Number.isFinite(dInput))$("spacing-slider").value=dInput;
    }
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
        $("observation").textContent=message;
        previousGuided=now;
      }else{
        $("observation").textContent=`The (${plane.plane}) planes are ${fmt(plane.d)} Å apart, but nλ ≤ 2d is not satisfied. No possible first-order reflection angle is shown.`;
      }
      $("explanation").textContent="Schematic 2D geometry; see model assumptions below.";
    }else{
      $("takeawayTitle").textContent="Advanced calculation";
      const inputMode=$("mode").value;
      $("observation").textContent=!result?"No valid Bragg condition for these inputs.":
        inputMode==="angle"
          ?`A peak at 2θ = ${fmt(result.twoTheta)}° implies d ≈ ${fmt(result.spacing)} Å for this wavelength and order. One peak cannot identify a phase.`
          :inputMode==="q"
          ?`At q = ${fmt(result.q)} Å⁻¹, the corresponding d-spacing is ${fmt(result.spacing)} Å for the selected order.`
          :`For d = ${fmt(result.spacing)} Å, a reflection is geometrically possible near 2θ = ${fmt(result.twoTheta)}° at this wavelength.`;
      $("explanation").textContent="Advanced inputs are independent of the guided square-lattice schematic.";
    }
    drawRay(result);
    drawInterference(result);
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
    else $("wavelengthDetails").open=true;
    update();
  });
  $("tryMeasuredPeak").addEventListener("click",()=>{
    $("advancedPanel").open=true;
    $("mode").value="angle";
    $("value").value="30";
    $("order").value="1";
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

