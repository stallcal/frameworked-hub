import { parseXY, findCandidates, findMarkerHit, hasCenterDrift, fitPeak, predictIntensity, scherrer, summarizeDomainSizes, syntheticPattern } from './analysis.mjs';

const byId = id => document.getElementById(id);
const canvas = byId('pxrdCanvas');
const ctx = canvas.getContext('2d');
const state = {
  data: [], peaks: [], selectedId: null, nextId: 1, source: '', simulated: false,
  mode: 'mof', view: null, plotGeometry: null, drag: null, statusTimer: null,
  patterns: [], activePatternId: null, nextPatternId: 1, normalizeOverlay: false
};
const form = {
  wavelength: byId('wavelength'), shapeFactor: byId('shapeFactor'), profile: byId('profile'),
  window: byId('windowSize'), correction: byId('correction'), instrument: byId('instrumentWidth')
};

const round = (v, dp = 2) => Number.isFinite(v) ? Number(v).toFixed(dp) : '—';
const n = el => el.value.trim() === '' ? NaN : Number(el.value);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const palette=['#084b9e','#9e382e','#089e4b','#8559bc','#c0851d','#347e93'];
const activePattern = () => state.patterns.find(p=>p.id===state.activePatternId)||null;
const fitUsable = peak => Boolean(peak?.fit?.fitted && peak.fit.rSquared>=.94 && !hasCenterDrift(peak.fit,peak.hint));
const allScanBounds = () => state.patterns.reduce((v,p)=>({min:Math.min(v.min,p.data[0].x),max:Math.max(v.max,p.data.at(-1).x)}),{min:Infinity,max:-Infinity});
const plotY = (value,pattern) => state.normalizeOverlay ? 100*value/(pattern?.maxIntensity||1):value;
function saveActive() {
  const p=activePattern();
  if(p){p.peaks=state.peaks;p.selectedId=state.selectedId;}
}
const selected = () => state.peaks.find(p => p.id === state.selectedId) || null;
const currentSettings = () => ({ wavelengthA: n(form.wavelength), shapeFactor: n(form.shapeFactor), correction: form.correction.value, instrumentalFwhmDeg: n(form.instrument) });
const calculate = peak => fitUsable(peak) ? scherrer({ twoTheta: peak.fit.center, fwhmDeg: peak.fit.fwhmDeg, ...currentSettings() }) : null;

function toast(message, error = false) {
  const element = byId('toast');
  element.textContent = message;
  element.classList.toggle('error', error);
  element.hidden = false;
  if (state.statusTimer) clearTimeout(state.statusTimer);
  state.statusTimer = setTimeout(() => { element.hidden = true; }, 4700);
}

function fitWindowFor(peaks,hint){
  const ds=peaks.filter(p=>Math.abs(p.hint-hint)>1e-6).map(p=>Math.abs(p.hint-hint));
  return ds.length?Math.min(n(form.window),Math.max(0.10,Math.min(...ds)*0.48)):n(form.window);
}
function refitAll(){
  saveActive();
  for(const record of state.patterns){
    record.peaks=record.peaks.map(p=>({
      ...p,fit:fitPeak(record.data,p.hint,fitWindowFor(record.peaks,p.hint),form.profile.value)
    }));
  }
  const active=activePattern();
  if(active){state.peaks=active.peaks;state.selectedId=active.selectedId;}
}
function renderPatterns(){
  const wrap=byId('loadedPatterns');
  byId('removeAllPatterns').disabled=!state.patterns.length;
  byId('removeActivePattern').disabled=!state.patterns.length;
  byId('normalizeOverlay').disabled=state.patterns.length<2;
  byId('normalizeOverlay').checked=state.normalizeOverlay;
  wrap.innerHTML=state.patterns.map(p=>`
    <div class="pattern-entry ${p.id===state.activePatternId?'is-active':''}">
      <div class="pattern-head">
        <input type="color" data-pattern-color="${p.id}" value="${p.color}" aria-label="Trace color for ${escapeHTML(p.source)}">
        <button type="button" class="pattern-activate" data-activate-pattern="${p.id}" aria-pressed="${p.id===state.activePatternId}">${p.id===state.activePatternId?'Active':'Analyze'}</button>
        <button type="button" class="pattern-remove" data-remove-pattern="${p.id}" aria-label="Remove ${escapeHTML(p.source)}">×</button>
      </div>
      <label class="pattern-label">Plot nickname<input data-nickname-pattern="${p.id}" type="text" maxlength="60" value="${escapeHTML(p.nickname)}"></label>
      <small class="pattern-filename" title="${escapeHTML(p.source)}">${escapeHTML(p.source)}</small>
    </div>`).join('');
  renderTraceLegend();
}
function renderTraceLegend(){
  byId('overlayLegend').innerHTML=state.patterns.map(p=>`<span><i style="background:${p.color}"></i>${escapeHTML(p.nickname)}</span>`).join('');
}
function activatePattern(id){
  if(state.activePatternId===id)return;
  saveActive();
  const p=state.patterns.find(item=>item.id===id);
  if(!p)return;
  state.activePatternId=id;state.data=p.data;state.peaks=p.peaks;state.selectedId=p.selectedId;
  state.source=p.source;state.simulated=p.simulated;
  updateAll();
}
function addPattern(data,source,simulated=false){
  if(state.patterns.length>=6){toast('Maximum six overlaid patterns. Remove one to continue.',true);return;}
  saveActive();
  const peaks=findCandidates(data).map(candidate=>({id:state.nextId++,hint:candidate.x,fit:null,automatic:true,included:false}));
  const record={id:state.nextPatternId++,source,nickname:source.replace(/\.[^.]+$/,'').slice(0,60),
    color:palette[state.patterns.length%palette.length],data,simulated,peaks,selectedId:peaks[0]?.id??null,
    maxIntensity:data.reduce((v,pt)=>Math.max(v,pt.y),1)};
  state.patterns.push(record);
  state.activePatternId=record.id;state.data=record.data;state.source=source;state.simulated=simulated;
  state.peaks=peaks;state.selectedId=record.selectedId;
  state.view=allScanBounds();
  refitAll();
  const strongest=state.peaks.filter(fitUsable).sort((a,b)=>b.fit.amplitude-a.fit.amplitude)[0];
  if(strongest)state.selectedId=strongest.id;
  updateAll();
}
function removePattern(id){
  saveActive();
  const index=state.patterns.findIndex(p=>p.id===id);
  if(index<0)return;
  const wasActive=state.activePatternId===id;
  state.patterns.splice(index,1);
  if(!state.patterns.length){clearPatterns();return;}
  if(state.patterns.length<2)state.normalizeOverlay=false;
  if(wasActive){
    const next=state.patterns[Math.min(index,state.patterns.length-1)];
    state.activePatternId=null;activatePattern(next.id);
  }
  state.view=allScanBounds();updateAll();
}
function clearPatterns(){
  state.patterns=[];state.activePatternId=null;state.data=[];state.peaks=[];
  state.selectedId=null;state.source='';state.simulated=false;state.view=null;state.plotGeometry=null;
  state.normalizeOverlay=false;state.nextId=1;state.nextPatternId=1;
  byId('fileInput').value='';byId('manualPeakAngle').value='';byId('chartTooltip').hidden=true;
  updateAll();
}
async function loadFiles(files){
  for(const file of files||[]){
    if(/\.brml$/i.test(file.name)){toast('BRML import is not supported. Export XY or XYE.',true);continue;}
    if(file.size>20*1024*1024){toast('Maximum file size: 20 MB per pattern.',true);continue;}
    if(state.patterns.length>=6){toast('Limit of six patterns reached.',true);break;}
    try{addPattern(parseXY(await file.text()),file.name,false);}
    catch(err){toast(err.message||'Could not parse PXRD data.',true);}
  }
  byId('fileInput').value='';
}
function loadDemo(){
  addPattern(syntheticPattern(),'Simulated teaching pattern',true);
  toast('Teaching example added — not measured PXRD data.');
}
function resetSettings(){
  for(const c of Object.values(form))c.value=c.defaultValue;
  state.mode='mof';
  for(const b of byId('materialMode').querySelectorAll('button')){
    const active=b.dataset.mode==='mof';
    b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
  }
  byId('instrumentField').hidden=true;
  byId('windowOutput').textContent=`±${round(n(form.window),2)}° 2θ`;
  if(state.patterns.length)refitAll();
  updateAll();
  toast('Settings reset. Uploaded patterns and reviewed reflections retained.');
}
byId('resetSettings').addEventListener('click',resetSettings);
byId('removeActivePattern').addEventListener('click',()=>{if(activePattern())removePattern(state.activePatternId);});
byId('removeAllPatterns').addEventListener('click',()=>{clearPatterns();toast('All scans removed; settings retained.');});
byId('normalizeOverlay').addEventListener('change',e=>{state.normalizeOverlay=e.target.checked;draw();});
byId('loadedPatterns').addEventListener('click',e=>{
  const activate=e.target.closest('[data-activate-pattern]');
  const remove=e.target.closest('[data-remove-pattern]');
  if(activate)activatePattern(Number(activate.dataset.activatePattern));
  if(remove)removePattern(Number(remove.dataset.removePattern));
});
byId('loadedPatterns').addEventListener('input',e=>{
  const target=e.target, colorId=target.dataset.patternColor,nicknameId=target.dataset.nicknamePattern;
  const record=state.patterns.find(p=>p.id===Number(colorId||nicknameId));
  if(!record)return;
  if(colorId)record.color=target.value;
  if(nicknameId)record.nickname=target.value.trim()||record.source;
  byId('patternName').textContent=activePattern()?.nickname||'Waiting for PXRD data';
  renderTraceLegend();draw();
});
byId('fileInput').addEventListener('change', e => loadFiles(Array.from(e.target.files||[])));
for (const id of ['demoButton', 'emptyDemo']) byId(id).addEventListener('click', loadDemo);
const dropzone = byId('dropzone');
for (const name of ['dragenter', 'dragover']) dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.add('dragover'); });
for (const name of ['dragleave', 'drop']) dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.remove('dragover'); });
dropzone.addEventListener('drop', e => loadFiles(Array.from(e.dataTransfer?.files||[])));
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
for (const el of [form.wavelength, form.shapeFactor, form.instrument]) el.addEventListener('input', () => { updateGuidance(); updateTable(); updateInspector(); updateSummary(); });
for (const el of [form.profile, form.window]) el.addEventListener('input', () => {
  byId('windowOutput').textContent = `±${round(n(form.window), 2)}° 2θ`;
  if (state.patterns.length) refitAll();
  updateAll();
});
form.correction.addEventListener('change', () => {
  byId('instrumentField').hidden = form.correction.value === 'none';
  updateGuidance(); updateTable(); updateInspector(); updateSummary();
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
    tbody.innerHTML = '<tr><td colspan="7" class="no-peaks">No peaks yet. Load a pattern, then click a reflection to fit it.</td></tr>';
    return;
  }
  tbody.innerHTML = state.peaks.map((p,i) => {
    const fit = p.fit;
    const result = calculate(p);
    const poor = fit && !fitUsable(p);
    return `<tr data-peak-id="${p.id}" class="${p.id === state.selectedId ? 'active' : ''}" tabindex="0" aria-selected="${p.id === state.selectedId}">
      <td><input type="checkbox" data-include-peak="${p.id}" aria-label="Include peak ${round(p.hint,3)} degrees in mean" ${p.included&&fitUsable(p)?'checked':''} ${fitUsable(p)?'':'disabled'}></td>
      <td class="peak-number">${String(i+1).padStart(2,'0')}${p.automatic ? '' : ' ✳'}</td>
      <td>${fit ? round(fit.center,3)+'°' : '—'}</td><td>${fit ? round(fit.fwhmDeg,3)+'°' : '—'}</td>
      <td class="${poor ? 'fit-poor' : ''}">${fit ? round(fit.rSquared,3)+(poor?' ⚠':'') : '—'}</td>
      <td class="value-strong">${result?.valid ? round(result.sizeNm,1) : '—'}</td>
      <td><button type="button" class="row-button">Inspect ↗</button></td></tr>`;
  }).join('');
  const poorCount = state.peaks.filter(p => !fitUsable(p)).length;
  const shiftedCount = state.peaks.filter(p => hasCenterDrift(p.fit, p.hint)).length;
  byId('resultsFooter').textContent = poorCount
    ? `${poorCount} fit(s) need review (quality, width bounds, or fit center). ${shiftedCount ? shiftedCount + ' fit(s) moved more than 0.07° from the selected reflection. ' : ''}Overlapping peaks require special attention; these are independent single-peak fits.`
    : 'Fits pass preliminary numerical checks, but each reflection still requires scientific review for overlap, background, strain, and instrument effects.';
}

byId('peakTableBody').addEventListener('click', event => {
  if(event.target.closest('[data-include-peak]'))return;
  const tr = event.target.closest('tr[data-peak-id]');
  if (tr) selectPeak(Number(tr.dataset.peakId));
});
byId('peakTableBody').addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const tr = event.target.closest('tr[data-peak-id]');
  if (tr) { event.preventDefault(); selectPeak(Number(tr.dataset.peakId)); }
});
function selectPeak(id) {
  state.selectedId=id;saveActive();
  updateTable();updateInspector();draw();
}
byId('peakTableBody').addEventListener('change',event=>{
  const box=event.target.closest('[data-include-peak]');
  if(!box)return;
  const peak=state.peaks.find(p=>p.id===Number(box.dataset.includePeak));
  if(!peak)return;
  peak.included=box.checked&&fitUsable(peak);
  saveActive();updateSummary();
});
function updateSummary(){
  const sizes=state.peaks.filter(p=>p.included&&fitUsable(p)).map(calculate)
    .filter(v=>v?.valid).map(v=>v.sizeNm);
  const summary=summarizeDomainSizes(sizes);
  byId('summaryCount').textContent=String(summary?.n||0);
  byId('summaryMean').textContent=summary?`${round(summary.mean,1)} nm`:'— nm';
  byId('summarySD').textContent=summary?.sd==null?'—':`${round(summary.sd,1)} nm`;
  byId('summarySEM').textContent=summary?.sem==null?'—':`${round(summary.sem,1)} nm`;
  byId('summaryNote').textContent=summary?.n>=2
    ? 'SD measures variation between selected reflections; SEM = SD / √n. Neither covers instrument broadening, width-fitting uncertainty, strain, or shape-factor uncertainty. These are not particle dimensions.'
    : 'Select at least two well-fitted, isolated reflections for a mean, sample SD and SEM. These are not complete measurement error bars or particle-size estimates.';
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
    byId('sizeQualifier').textContent = !fitUsable(peak)
      ? 'Fit rejected (R², width, or center drift). Try a narrower fitting window or inspect overlap.'
      : result?.error || 'Invalid measurement settings';
    byId('formulaDetail').textContent = `Observed FWHM: ${round(fit.fwhmDeg,4)}° 2θ. Review instrument FWHM and correction mode.`;
    return;
  }
  byId('sizeValue').innerHTML = `${round(result.sizeNm,1)} <small>nm</small>`;
  byId('sizeQualifier').textContent = hasCenterDrift(fit, peak.hint)
    ? `Fit shifted ${round(Math.abs(fit.center - peak.hint), 3)}° from selected 2θ. Verify peak identity; do not report this size without review.`
    : `${form.correction.value === 'none' ? 'Uncorrected' : 'Assumption-corrected'} · ${fit.fitted && fit.rSquared >= .94 ? 'review fit before reporting' : 'fit requires attention'}`;
  const instrumentPart = form.correction.value === 'none' ? 'no instrumental correction' : `${form.correction.value} subtraction of ${round(n(form.instrument),3)}°`;
  byId('formulaDetail').textContent = `2θ = ${round(fit.center,3)}° → θ = ${round(result.thetaDeg,3)}° · FWHM = ${round(fit.fwhmDeg,4)}° → β = ${round(result.betaRad,7)} rad (${instrumentPart}). D = (${round(n(form.shapeFactor),2)} × ${round(result.wavelengthNm,5)} nm) / (${round(result.betaRad,7)} × cos ${round(result.thetaDeg,3)}°).`;
}

function updateAll(){
  saveActive();
  const active=activePattern(),bounds=state.patterns.length?allScanBounds():null;
  const pointCount=state.patterns.reduce((a,p)=>a+p.data.length,0);
  byId('patternName').textContent=active?.nickname||'Waiting for PXRD data';
  byId('plotStatus').textContent=active?`${state.patterns.length} LOADED`:'NO DATA';
  byId('plotStatus').className='pill '+(active?.simulated?'warning':active?'ready':'');
  byId('plotDescriptor').textContent=bounds?`${state.patterns.length} scan(s) · ${pointCount.toLocaleString()} points · ${round(bounds.min)}–${round(bounds.max)}° 2θ`:'Select a file or load the example to begin.';
  byId('fileInfo').hidden=!active;
  byId('fileInfo').textContent=active?`Active: ${active.source} · ${active.data.length.toLocaleString()} XY points · processed locally`:'';
  byId('emptyState').hidden=Boolean(active);
  byId('chartContainer').classList.toggle('has-data',Boolean(active));
  byId('downloadButton').disabled=!active;
  renderPatterns();updateGuidance();updateTable();updateInspector();updateSummary();draw();
}

const niceStep = (range, goal = 6) => {
  if (!Number.isFinite(range) || range <= 0) return 1;
  const raw = range / goal;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map(v => v*mag).find(v => v >= raw) || 10*mag;
};

function peakMarkerPosition(peak) {
  // Mark the measured candidate location, not a fitted center that may drift to a neighbor.
  const point = state.data.reduce((nearest, candidate) =>
    !nearest || Math.abs(candidate.x - peak.hint) < Math.abs(nearest.x - peak.hint) ? candidate : nearest, null);
  return point ? { x: peak.hint, y: point.y } : null;
}

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
  const visibleByPattern=state.patterns.map(record=>({
    record,points:record.data.filter(pt=>pt.x>=xMin&&pt.x<=xMax)
  }));
  const displayed=visibleByPattern.flatMap(entry=>entry.points.map(pt=>plotY(pt.y,entry.record)));
  if(!displayed.length)return;
  const rawMinY=displayed.reduce((v,y)=>Math.min(v,y),Infinity);
  const rawMaxY=displayed.reduce((v,y)=>Math.max(v,y),-Infinity);
  const spanY=Math.max(rawMaxY-rawMinY,Math.abs(rawMaxY)*.01,1);
  const yMin=Math.min(0,rawMinY-spanY*.08);
  const yMax=rawMaxY+spanY*.12;
  const fx=x=>p.left+(x-xMin)/(xMax-xMin)*(p.right-p.left);
  const fy=y=>p.bottom-(y-yMin)/(yMax-yMin)*(p.bottom-p.top);
  state.plotGeometry={p,xMin,xMax,yMin,yMax,fx,fy,width,height};
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
  ctx.save();ctx.translate(13,(p.top+p.bottom)/2);ctx.rotate(-Math.PI/2);ctx.fillText(state.normalizeOverlay?'Relative intensity (% max)':'Intensity (a.u.)',0,0);ctx.restore();
  ctx.save();ctx.beginPath();ctx.rect(p.left,p.top,p.right-p.left,p.bottom-p.top);ctx.clip();
  for(const entry of visibleByPattern){
    if(!entry.points.length)continue;
    ctx.strokeStyle=entry.record.color;
    ctx.lineWidth=entry.record.id===state.activePatternId?2:1.3;
    ctx.globalAlpha=entry.record.id===state.activePatternId?1:.74;
    ctx.beginPath();
    entry.points.forEach((pt,i)=>{
      const x=fx(pt.x),y=fy(plotY(pt.y,entry.record));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }
  ctx.globalAlpha=1;
  const peak=selected(),fit=peak?.fit;
  for(const pp of state.peaks){
    const marker = peakMarkerPosition(pp);
    if(!marker || marker.x<xMin || marker.x>xMax) continue;
    const active=pp.id===state.selectedId;
    ctx.beginPath();ctx.arc(fx(marker.x),fy(plotY(marker.y,activePattern())),active?5:3.2,0,Math.PI*2);
    ctx.fillStyle=fitUsable(pp)?'#089e4b':'#fff';
    ctx.fill();
    ctx.strokeStyle=active?'#084b9e':fitUsable(pp)?'#089e4b':'#9e382e';
    ctx.lineWidth=active?2.4:1.5;ctx.stroke();
  }
  if(fit && fitUsable(peak)){
    ctx.strokeStyle='#089e4b';ctx.lineWidth=2.2;ctx.setLineDash([6,4]);ctx.beginPath();
    let started=false;
    for(let i=0;i<=250;i++){
      const x=fit.startX+(fit.endX-fit.startX)*i/250;
      if(x<xMin||x>xMax)continue;
      const y=plotY(predictIntensity(x,fit),activePattern());
      if(!started){ctx.moveTo(fx(x),fy(y));started=true;}else ctx.lineTo(fx(x),fy(y));
    }ctx.stroke();ctx.setLineDash([]);
    const yHalf=plotY(fit.intercept+fit.amplitude/2,activePattern());
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
function addPeakAt(hint) {
  if (!state.data.length) return toast('Load a PXRD pattern before adding a peak.', true);
  if (!Number.isFinite(hint) || hint < state.data[0].x || hint > state.data.at(-1).x)
    return toast(`Enter a 2θ position within the loaded range (${round(state.data[0].x, 2)}–${round(state.data.at(-1).x, 2)}°).`, true);
  const duplicate = state.peaks.find(p => Math.abs(p.hint - hint) < 1e-6);
  if (duplicate) return selectPeak(duplicate.id);
  const peak={id:state.nextId++,hint,fit:null,automatic:false,included:false};
  state.peaks.push(peak);
  state.peaks.sort((a,b)=>a.hint-b.hint);
  saveActive();refitAll();selectPeak(peak.id);updateSummary();
  if(!fitUsable(state.peaks.find(p=>p.id===peak.id)))
    toast('Reflection marked, but the fit is not reliable. Adjust the window or inspect overlapping peaks.',true);
}

function choosePeakAt(x, clientX, clientY) {
  if (!state.data.length || !Number.isFinite(x) || !state.plotGeometry) return;
  const rect = canvas.getBoundingClientRect();
  const g = state.plotGeometry;
  const existing = findMarkerHit(state.peaks, clientX - rect.left, clientY - rect.top, peak => {
    const point = peakMarkerPosition(peak);
    return point ? { x: g.fx(point.x), y: g.fy(point.y) } : null;
  });
  if (existing) return selectPeak(existing.id);
  const step = (state.data.at(-1).x - state.data[0].x) / (state.data.length - 1);
  const radius = Math.min(0.09, Math.max(3 * step, (state.view.max - state.view.min) / 900));
  const neighborhood = state.data.filter(p => Math.abs(p.x - x) <= radius);
  const peakPoint = neighborhood.reduce((best, p) => !best || p.y > best.y ? p : best, null)
    || state.data.reduce((a,b) => Math.abs(b.x-x) < Math.abs(a.x-x) ? b : a);
  addPeakAt(peakPoint.x);
}

const manualPeakInput = byId('manualPeakAngle');
function addManualPeak() {
  const raw = manualPeakInput.value.trim();
  if (!raw) return toast('Enter a 2θ position before adding a peak.', true);
  addPeakAt(Number(raw));
}
byId('addManualPeak').addEventListener('click', addManualPeak);
manualPeakInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); addManualPeak(); }
});

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
  if(!moved)choosePeakAt(clientXToDataX(e.clientX), e.clientX, e.clientY);
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
  const bounds=allScanBounds();
  const minSpan=Math.max((bounds.max-bounds.min)/500,0.06);
  const maxSpan=(bounds.max-bounds.min)*2.4;
  const oldSpan=state.view.max-state.view.min;
  const newSpan=Math.max(minSpan,Math.min(maxSpan,oldSpan*factor));
  const anchor=pivot??(state.view.min+state.view.max)/2;
  const ratio=(anchor-state.view.min)/oldSpan;
  state.view={min:anchor-ratio*newSpan,max:anchor+(1-ratio)*newSpan};
  draw();
}
byId('zoomIn').addEventListener('click',()=>zoom(.75));
byId('zoomOut').addEventListener('click',()=>zoom(1.3));
byId('resetZoom').addEventListener('click',()=>{if(state.data.length){state.view=allScanBounds();draw();}});
if('ResizeObserver' in window)new ResizeObserver(draw).observe(byId('chartContainer'));
else window.addEventListener('resize',draw);

function csvCell(value) {
  const s=String(value??'');
  return `"${s.replaceAll('"','""')}"`;
}
function downloadCSV() {
  if(!state.data.length)return;
  const cfg=currentSettings();
  const headers=['Peak','Included_in_mean','Status','Requested_2theta_deg','2theta_deg','theta_deg','Observed_FWHM_deg_2theta','Corrected_FWHM_deg_2theta','Beta_rad','Size_nm','Fit_R_squared','Profile','PseudoVoigt_Lorentzian_fraction','Wavelength_A','Shape_factor_K','Correction_assumption','Instrument_FWHM_deg_2theta'];
  const rows=[['# Frameworked Scherrer Calculator v0.1 — exploratory, verify all fitted reflections'],['# Input file',state.source],['# Dataset',state.simulated?'SIMULATED':'USER PXRD FILE'],['# Instrumental broadening and microstrain must be evaluated before interpreting domain size'],headers];
  state.peaks.forEach((peak,i)=>{
    const f=peak.fit,r=calculate(peak);
    rows.push([i+1,peak.included&&fitUsable(peak)?'yes':'no',(!f?'unfitted':fitUsable(peak)?'review':'poor-fit-review'),peak.hint,f?.center,r?.thetaDeg,f?.fwhmDeg,r?.sampleWidthDeg,r?.betaRad,r?.valid?r.sizeNm:null,f?.rSquared,f?.model,f?.eta,cfg.wavelengthA,cfg.shapeFactor,cfg.correction,cfg.instrumentalFwhmDeg]);
  });
  const includedSizes=state.peaks.filter(p=>p.included&&fitUsable(p))
    .map(calculate).filter(x=>x?.valid).map(x=>x.sizeNm);
  const summary=summarizeDomainSizes(includedSizes);
  rows.push(['# Selected-peak mean (nm)',summary?.mean??'']);
  rows.push(['# Sample SD (nm)',summary?.sd??'']);
  rows.push(['# Standard error of mean (nm)',summary?.sem??'']);
  rows.push(['# These spread statistics omit instrument/profile/strain/K uncertainty']);
  const output=rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([output],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='frameworked-scherrer-results.csv';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Results exported, including method settings and fit-quality flags.');
}
byId('downloadButton').addEventListener('click',downloadCSV);
updateAll();
