import { parseXY, findCandidates, fitPeak, predictIntensity, scherrer, syntheticPattern } from './analysis.mjs';

const byId = id => document.getElementById(id);
const canvas = byId('pxrdCanvas');
const ctx = canvas.getContext('2d');
const state = {
  data: [], peaks: [], selectedId: null, nextId: 1, source: '', simulated: false,
  mode: 'mof', view: null, plotGeometry: null, drag: null, statusTimer: null
};
const form = {
  wavelength: byId('wavelength'), shapeFactor: byId('shapeFactor'), profile: byId('profile'),
  window: byId('windowSize'), correction: byId('correction'), instrument: byId('instrumentWidth')
};

const round = (v, dp = 2) => Number.isFinite(v) ? Number(v).toFixed(dp) : '—';
const n = el => Number(el.value);
const selected = () => state.peaks.find(p => p.id === state.selectedId) || null;
const currentSettings = () => ({ wavelengthA: n(form.wavelength), shapeFactor: n(form.shapeFactor), correction: form.correction.value, instrumentalFwhmDeg: n(form.instrument) });
const calculate = peak => peak?.fit ? scherrer({ twoTheta: peak.fit.center, fwhmDeg: peak.fit.fwhmDeg, ...currentSettings() }) : null;

function toast(message, error = false) {
  const element = byId('toast');
  element.textContent = message;
  element.classList.toggle('error', error);
  element.hidden = false;
  if (state.statusTimer) clearTimeout(state.statusTimer);
  state.statusTimer = setTimeout(() => { element.hidden = true; }, 4700);
}

function prepareData(data, source, simulated = false) {
  state.data = data;
  state.source = source;
  state.simulated = simulated;
  state.selectedId = null;
  state.peaks = [];
  state.view = { min: data[0].x, max: data.at(-1).x };
  const suggestions = findCandidates(data);
  for (const candidate of suggestions) state.peaks.push({ id: state.nextId++, hint: candidate.x, fit: null, automatic: true });
  refitAll();
  const strongest = [...state.peaks].filter(p => p.fit?.fitted).sort((a,b) => b.fit.amplitude - a.fit.amplitude)[0];
  if (strongest) state.selectedId = strongest.id;
  else if (state.peaks.length) state.selectedId = state.peaks[0].id;
  byId('patternName').textContent = source;
  byId('plotStatus').textContent = simulated ? 'SIMULATED' : 'LOADED';
  byId('plotStatus').className = 'pill ' + (simulated ? 'warning' : 'ready');
  byId('plotDescriptor').textContent = `${data.length.toLocaleString()} points · ${round(data[0].x)}–${round(data.at(-1).x)}° 2θ`;
  byId('fileInfo').hidden = false;
  byId('fileInfo').textContent = simulated ? 'Simulated teaching dataset — not a measured MOF or calibration standard.' : `${source} · ${data.length.toLocaleString()} XY points · processed locally`;
  byId('emptyState').hidden = true;
  byId('chartContainer').classList.add('has-data');
  byId('downloadButton').disabled = false;
  updateAll();
  if (suggestions.length === 0) toast('Data loaded. No distinct candidate peaks found; click the graph to select one manually.');
}

function refitAll() {
  const halfWindow = n(form.window);
  const model = form.profile.value;
  state.peaks = state.peaks.map(p => ({ ...p, fit: fitPeak(state.data, p.hint, halfWindow, model) }));
}

async function loadFile(file) {
  if (!file) return;
  if (/\.brml$/i.test(file.name)) return toast('BRML archives are not yet supported. Export the diffraction data as XYE or XY to analyze it here.', true);
  if (file.size > 20 * 1024 * 1024) return toast('Maximum file size is 20 MB for this browser-based version.', true);
  try {
    const text = await file.text();
    const data = parseXY(text);
    prepareData(data, file.name, false);
    toast(`Loaded ${data.length.toLocaleString()} PXRD points. Review the proposed peak fits.`);
  } catch (error) {
    toast(error.message || 'Could not read the file.', true);
  }
}

function loadDemo() {
  prepareData(syntheticPattern(), 'Simulated MOF-like pattern', true);
  toast('Teaching example loaded. These are synthetic peaks, not experimental data.');
}

byId('fileInput').addEventListener('change', e => loadFile(e.target.files?.[0]));
for (const id of ['demoButton', 'emptyDemo']) byId(id).addEventListener('click', loadDemo);
const dropzone = byId('dropzone');
for (const name of ['dragenter', 'dragover']) dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.add('dragover'); });
for (const name of ['dragleave', 'drop']) dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.remove('dragover'); });
dropzone.addEventListener('drop', e => loadFile(e.dataTransfer?.files?.[0]));
dropzone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); byId('fileInput').click(); } });

for (const button of byId('materialMode').querySelectorAll('button')) {
  button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    for (const b of byId('materialMode').querySelectorAll('button')) {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    }
    updateGuidance();
  });
}
for (const el of [form.wavelength, form.shapeFactor, form.instrument]) el.addEventListener('input', () => { updateGuidance(); updateTable(); updateInspector(); });
for (const el of [form.profile, form.window]) el.addEventListener('input', () => {
  byId('windowOutput').textContent = `±${round(n(form.window), 2)}°`;
  if (state.data.length) refitAll();
  updateAll();
});
form.correction.addEventListener('change', () => {
  byId('instrumentField').hidden = form.correction.value === 'none';
  updateGuidance(); updateTable(); updateInspector();
});

function updateGuidance() {
  const mode = state.mode;
  const correction = form.correction.value;
  if (correction === 'none') {
    byId('correctionStatus').textContent = 'Uncorrected analysis';
    byId('correctionHelp').textContent = mode === 'mof'
      ? 'For MOFs, disorder, strain, and anisotropic domains may broaden peaks. Size estimates are preliminary.'
      : 'Instrument, strain, and defect broadening are not removed. Size estimates are preliminary.';
  } else {
    byId('correctionStatus').textContent = `Assumed ${correction} correction`;
    byId('correctionHelp').textContent = 'Use only a measured standard at matching settings. A single FWHM is an approximation, especially with pseudo-Voigt fits.';
  }
  if (state.mode === 'mof') {
    byId('inspectorText').textContent = 'MOF reflection widths may also reflect lattice strain, defects, guest effects, and anisotropic coherent domains. Review each fit and compare reflections before drawing conclusions.';
  } else {
    byId('inspectorText').textContent = 'The Scherrer equation estimates coherent scattering domain length, not particle diameter. Review the fit and broadening assumptions before reporting a result.';
  }
}

function updateTable() {
  const tbody = byId('peakTableBody');
  byId('peakCount').textContent = state.peaks.length;
  if (!state.peaks.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-peaks">No peaks yet. Load a pattern, then click a reflection to fit it.</td></tr>';
    return;
  }
  tbody.innerHTML = state.peaks.map((p,i) => {
    const fit = p.fit;
    const result = calculate(p);
    const poor = fit && (!fit.fitted || fit.rSquared < .94);
    return `<tr data-peak-id="${p.id}" class="${p.id === state.selectedId ? 'active' : ''}" tabindex="0" aria-selected="${p.id === state.selectedId}">
      <td class="peak-number">${String(i+1).padStart(2,'0')}${p.automatic ? '' : ' ✳'}</td>
      <td>${fit ? round(fit.center,3)+'°' : '—'}</td><td>${fit ? round(fit.fwhmDeg,3)+'°' : '—'}</td>
      <td class="${poor ? 'fit-poor' : ''}">${fit ? round(fit.rSquared,3)+(poor?' ⚠':'') : '—'}</td>
      <td class="value-strong">${result?.valid ? round(result.sizeNm,1) : '—'}</td>
      <td><button type="button" class="row-button">Inspect ↗</button></td></tr>`;
  }).join('');
  const poorCount = state.peaks.filter(p => !p.fit?.fitted || p.fit.rSquared < .94).length;
  byId('resultsFooter').textContent = poorCount
    ? `${poorCount} fit(s) need particular review (low R², overly narrow/broad profile, or incomplete peak). Peak overlap and background can also affect high-R² fits.`
    : 'All detected peaks have plausible numerical fits, but each still requires scientific review for overlap, background, strain, and instrument effects.';
}

byId('peakTableBody').addEventListener('click', event => {
  const tr = event.target.closest('tr[data-peak-id]');
  if (tr) selectPeak(Number(tr.dataset.peakId));
});
byId('peakTableBody').addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const tr = event.target.closest('tr[data-peak-id]');
  if (tr) { event.preventDefault(); selectPeak(Number(tr.dataset.peakId)); }
});
function selectPeak(id) {
  state.selectedId = id;
  updateTable(); updateInspector(); draw();
}

function updateInspector() {
  const peak = selected();
  const fit = peak?.fit;
  const result = calculate(peak);
  byId('lambdaValue').textContent = Number.isFinite(n(form.wavelength)) ? `${round(n(form.wavelength), 4)} Å` : '—';
  byId('kValue').textContent = Number.isFinite(n(form.shapeFactor)) ? round(n(form.shapeFactor), 2) : '—';
  if (!fit) {
    byId('sizeValue').innerHTML = '— <small>nm</small>';
    byId('sizeQualifier').textContent = peak ? 'Peak fit unavailable' : 'No reflection selected';
    byId('thetaValue').textContent = '—'; byId('betaValue').textContent = '—';
    byId('formulaDetail').textContent = 'D = K × λ / (β × cos θ) · width in radians, length in nm.';
    return;
  }
  byId('thetaValue').textContent = `${round(fit.center/2,3)}°`;
  byId('betaValue').textContent = result?.valid ? `${round(result.betaRad,6)} rad` : 'Not resolved';
  if (!result?.valid) {
    byId('sizeValue').innerHTML = '— <small>nm</small>';
    byId('sizeQualifier').textContent = result?.error || 'Invalid measurement settings';
    byId('formulaDetail').textContent = `Observed FWHM: ${round(fit.fwhmDeg,4)}° 2θ. Review instrument FWHM and correction mode.`;
    return;
  }
  byId('sizeValue').innerHTML = `${round(result.sizeNm,1)} <small>nm</small>`;
  byId('sizeQualifier').textContent = `${form.correction.value === 'none' ? 'Uncorrected' : 'Assumption-corrected'} · ${fit.fitted && fit.rSquared >= .94 ? 'review fit before reporting' : 'fit requires attention'}`;
  const instrumentPart = form.correction.value === 'none' ? 'no instrumental correction' : `${form.correction.value} subtraction of ${round(n(form.instrument),3)}°`;
  byId('formulaDetail').textContent = `2θ = ${round(fit.center,3)}° → θ = ${round(result.thetaDeg,3)}° · FWHM = ${round(fit.fwhmDeg,4)}° → β = ${round(result.betaRad,7)} rad (${instrumentPart}). D = (${round(n(form.shapeFactor),2)} × ${round(result.wavelengthNm,5)} nm) / (${round(result.betaRad,7)} × cos ${round(result.thetaDeg,3)}°).`;
}

function updateAll() { updateGuidance(); updateTable(); updateInspector(); draw(); }

const niceStep = (range, goal = 6) => {
  if (!Number.isFinite(range) || range <= 0) return 1;
  const raw = range / goal;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map(v => v*mag).find(v => v >= raw) || 10*mag;
};

function draw() {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(200, bounds.width), height = Math.max(220, bounds.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,width,height);
  if (!state.data.length || !state.view) return;
  const p = { left: 58, right: width - 17, top: 20, bottom: height - 45 };
  const xMin = state.view.min, xMax = state.view.max;
  const visible = state.data.filter(pt => pt.x >= xMin && pt.x <= xMax);
  if (!visible.length) return;
  let rawMinY = Infinity, rawMaxY = -Infinity;
  for(const pt of visible){rawMinY=Math.min(rawMinY,pt.y);rawMaxY=Math.max(rawMaxY,pt.y);}
  const spanY = Math.max(rawMaxY - rawMinY, Math.abs(rawMaxY)*.01, 1);
  const yMin = Math.min(0,rawMinY - spanY*.08);
  const yMax = rawMaxY + spanY*.12;
  const fx = x => p.left+(x-xMin)/(xMax-xMin)*(p.right-p.left);
  const fy = y => p.bottom-(y-yMin)/(yMax-yMin)*(p.bottom-p.top);
  state.plotGeometry = { p, xMin, xMax, yMin, yMax, fx, fy, width, height };

  ctx.fillStyle='#fff'; ctx.fillRect(0,0,width,height);
  ctx.font='10px system-ui, sans-serif'; ctx.lineWidth=1; ctx.strokeStyle='#e4eaf4'; ctx.fillStyle='#7289a6';
  const xStep = niceStep(xMax-xMin,7), yStep = niceStep(yMax-yMin,5);
  for(let x=Math.ceil(xMin/xStep)*xStep; x<=xMax+1e-9; x+=xStep){
    const pos=fx(x);ctx.beginPath();ctx.moveTo(pos,p.top);ctx.lineTo(pos,p.bottom);ctx.stroke();
    ctx.textAlign='center';ctx.fillText(xStep<1?round(x,2):round(x,1),pos,p.bottom+18);
  }
  for(let y=Math.ceil(yMin/yStep)*yStep; y<=yMax+1e-9; y+=yStep){
    const pos=fy(y);ctx.beginPath();ctx.moveTo(p.left,pos);ctx.lineTo(p.right,pos);ctx.stroke();
    ctx.textAlign='right';ctx.fillText(Number(y).toLocaleString(undefined,{maximumFractionDigits:1}),p.left-8,pos+3);
  }
  ctx.fillStyle='#536f91';ctx.font='10px system-ui, sans-serif';ctx.textAlign='center';
  ctx.fillText('2θ (degrees)',(p.left+p.right)/2,height-8);
  ctx.save();ctx.translate(13,(p.top+p.bottom)/2);ctx.rotate(-Math.PI/2);ctx.fillText('Intensity (a.u.)',0,0);ctx.restore();
  ctx.save();ctx.beginPath();ctx.rect(p.left,p.top,p.right-p.left,p.bottom-p.top);ctx.clip();
  ctx.lineWidth=1.4;ctx.strokeStyle='#084b9e';ctx.beginPath();
  visible.forEach((pt,i)=>{ const x=fx(pt.x),y=fy(pt.y);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y); });ctx.stroke();
  const peak=selected(),fit=peak?.fit;
  for(const pp of state.peaks){
    const ff=pp.fit;if(!ff||ff.center<xMin||ff.center>xMax)continue;
    ctx.fillStyle=pp.id===state.selectedId?'#9e382e':'#63a781';
    ctx.beginPath();ctx.arc(fx(ff.center),fy(ff.intercept+ff.amplitude),pp.id===state.selectedId?4:2.5,0,Math.PI*2);ctx.fill();
  }
  if(fit){
    ctx.strokeStyle='#089e4b';ctx.lineWidth=2.2;ctx.setLineDash([6,4]);ctx.beginPath();
    let started=false;
    for(let i=0;i<=250;i++){
      const x=fit.startX+(fit.endX-fit.startX)*i/250;
      if(x<xMin||x>xMax)continue;
      const y=predictIntensity(x,fit);
      if(!started){ctx.moveTo(fx(x),fy(y));started=true;}else ctx.lineTo(fx(x),fy(y));
    }ctx.stroke();ctx.setLineDash([]);
    const yHalf=fit.intercept+fit.amplitude/2;
    ctx.strokeStyle='#9e382e';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(fx(fit.center-fit.fwhmDeg/2),fy(yHalf));ctx.lineTo(fx(fit.center+fit.fwhmDeg/2),fy(yHalf));ctx.stroke();
    ctx.setLineDash([4,5]);ctx.strokeStyle='#9e382e80';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fx(fit.center),p.top);ctx.lineTo(fx(fit.center),p.bottom);ctx.stroke();ctx.setLineDash([]);
  }
  ctx.restore();
}

function clientXToDataX(clientX) {
  const g=state.plotGeometry;if(!g)return null;
  const px=clientX-canvas.getBoundingClientRect().left;
  return g.xMin + (px-g.p.left)/(g.p.right-g.p.left)*(g.xMax-g.xMin);
}
function choosePeakAt(x) {
  if(!state.data.length || !Number.isFinite(x))return;
  const existing=state.peaks.reduce((best,p)=>best===null || Math.abs(p.hint-x)<Math.abs(best.hint-x)?p:best,null);
  if(existing && Math.abs(existing.hint-x)<Math.max(0.12,(state.view.max-state.view.min)/80)){
    selectPeak(existing.id);return;
  }
  const neighborhood=state.data.filter(p=>Math.abs(p.x-x)<=Math.min(.22,n(form.window)*.45));
  const peakPoint=neighborhood.sort((a,b)=>b.y-a.y)[0] || state.data.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);
  const hint=peakPoint.x;
  const fit=fitPeak(state.data,hint,n(form.window),form.profile.value);
  const peak={id:state.nextId++,hint,fit,automatic:false};
  state.peaks.push(peak);state.peaks.sort((a,b)=>a.hint-b.hint);
  selectPeak(peak.id);
  if(!fit) toast('Insufficient data around this point. Increase the fitting window or choose a clearer reflection.',true);
}

canvas.addEventListener('pointerdown',e=>{
  if(!state.data.length)return;
  canvas.setPointerCapture(e.pointerId);
  state.drag={start:e.clientX,last:e.clientX,moved:false,view:{...state.view}};
});
canvas.addEventListener('pointermove',e=>{
  if(!state.data.length || !state.plotGeometry)return;
  const rect=canvas.getBoundingClientRect();
  if(state.drag){
    if(Math.abs(e.clientX-state.drag.start)>5)state.drag.moved=true;
    if(state.drag.moved){
      const span=state.drag.view.max-state.drag.view.min;
      const dx=(e.clientX-state.drag.start)/(state.plotGeometry.p.right-state.plotGeometry.p.left)*span;
      state.view={min:state.drag.view.min-dx,max:state.drag.view.max-dx};
      draw();
    }
  }
  const x=clientXToDataX(e.clientX);
  if(x===null || x<state.data[0].x || x>state.data.at(-1).x){byId('chartTooltip').hidden=true;return;}
  let lo=0,hi=state.data.length-1;
  while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(state.data[mid].x<x)lo=mid;else hi=mid;}
  const point=Math.abs(state.data[lo].x-x)<Math.abs(state.data[hi].x-x)?state.data[lo]:state.data[hi];
  const tooltip=byId('chartTooltip');tooltip.textContent=`${round(point.x,3)}° · ${round(point.y,1)} a.u.`;
  tooltip.hidden=false;
  tooltip.style.left=`${Math.max(8,Math.min(rect.width-145,e.clientX-rect.left+12))}px`;
  tooltip.style.top=`${Math.max(8,e.clientY-rect.top-38)}px`;
});
canvas.addEventListener('pointerup',e=>{
  if(!state.drag)return;
  const moved=state.drag.moved;
  state.drag=null;
  if(!moved)choosePeakAt(clientXToDataX(e.clientX));
});
canvas.addEventListener('pointercancel',()=>state.drag=null);
canvas.addEventListener('pointerleave',()=>{byId('chartTooltip').hidden=true;});
canvas.addEventListener('wheel',e=>{
  if(!state.data.length)return;
  e.preventDefault();
  const pivot=clientXToDataX(e.clientX);
  if(pivot===null)return;
  zoom(e.deltaY>0?1.18:0.84,pivot);
},{passive:false});

function zoom(factor,pivot){
  if(!state.data.length || !state.view)return;
  const minSpan=Math.max((state.data.at(-1).x-state.data[0].x)/500,0.06);
  const maxSpan=(state.data.at(-1).x-state.data[0].x)*2.4;
  const oldSpan=state.view.max-state.view.min;
  const newSpan=Math.max(minSpan,Math.min(maxSpan,oldSpan*factor));
  const anchor=pivot??(state.view.min+state.view.max)/2;
  const ratio=(anchor-state.view.min)/oldSpan;
  state.view={min:anchor-ratio*newSpan,max:anchor+(1-ratio)*newSpan};
  draw();
}
byId('zoomIn').addEventListener('click',()=>zoom(.75));
byId('zoomOut').addEventListener('click',()=>zoom(1.3));
byId('resetZoom').addEventListener('click',()=>{if(state.data.length){state.view={min:state.data[0].x,max:state.data.at(-1).x};draw();}});
if('ResizeObserver' in window)new ResizeObserver(draw).observe(byId('chartContainer'));
else window.addEventListener('resize',draw);

function csvCell(value) {
  const s=String(value??'');
  return `"${s.replaceAll('"','""')}"`;
}
function downloadCSV() {
  if(!state.data.length)return;
  const cfg=currentSettings();
  const headers=['Peak','Status','2theta_deg','theta_deg','Observed_FWHM_deg_2theta','Corrected_FWHM_deg_2theta','Beta_rad','Size_nm','Fit_R_squared','Profile','PseudoVoigt_Lorentzian_fraction','Wavelength_A','Shape_factor_K','Correction_assumption','Instrument_FWHM_deg_2theta'];
  const rows=[['# Frameworked Scherrer Lab v0.1 — exploratory, verify all fitted reflections'],['# Input file',state.source],['# Dataset',state.simulated?'SIMULATED':'USER PXRD FILE'],['# Instrumental broadening and microstrain must be evaluated before interpreting domain size'],headers];
  state.peaks.forEach((peak,i)=>{
    const f=peak.fit,r=calculate(peak);
    rows.push([i+1,(!f?'unfitted':f.fitted&&f.rSquared>=.94?'review':'poor-fit-review'),f?.center,r?.thetaDeg,f?.fwhmDeg,r?.sampleWidthDeg,r?.betaRad,r?.valid?r.sizeNm:null,f?.rSquared,f?.model,f?.eta,cfg.wavelengthA,cfg.shapeFactor,cfg.correction,cfg.instrumentalFwhmDeg]);
  });
  const output=rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([output],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='frameworked-scherrer-results.csv';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Results exported, including method settings and fit-quality flags.');
}
byId('downloadButton').addEventListener('click',downloadCSV);
updateGuidance();
draw();
