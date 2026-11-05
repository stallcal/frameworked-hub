// Atlas publication-gate audit: fail on invalid structure, report unverified work honestly.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('assets/atlas/atlas.js','utf8');
function embedded(name, suffix=''){
 const result=html.match(new RegExp('^const '+name+'=(.*)'+suffix+';$','m'));
 assert.ok(result, 'Missing '+name+' inline source');
 return JSON.parse(result[1]);
}
const data=embedded('DATA');
const places=data.places;
const events=embedded('EVENTS','\\.events').events;
const allowedAccess=new Set(['public_venue','scheduled_public','research_campus']);
const allowedRegions=new Set(['dfw','central','houston','gulf','west','east','south','panhandle','north']);
assert.ok(places.length>=1 && events.length>=1,'Empty data collections');
let pending=0,verified=0,approximate=0,reviewedCoordinates=0;
const ids=new Set();
const collegeIds=new Set();
for(const p of places){
 if(p.college){
  const {unitid,level,community,research,programs}=p.college;
  const campusKey=unitid+'/'+(p.college.campus||'');
  assert.ok(Number.isInteger(unitid)&&!collegeIds.has(campusKey),'Invalid or duplicate college location: '+p.id);
  collegeIds.add(campusKey);
  assert.ok(['four_year','two_year'].includes(level)&&typeof community==='boolean','Invalid college type: '+p.id);
  assert.ok([null,'R1','R2','RCU'].includes(research)&&programs.length>0,'Missing or invalid program data: '+p.id);
 }
 assert.ok(!ids.has(p.id),'Duplicate institution ID: '+p.id);ids.add(p.id);
 assert.ok(p.name && p.city && p.address,'Incomplete location: '+p.id);
 assert.ok(allowedRegions.has(p.region),'Unknown region: '+p.id);
 assert.ok(allowedAccess.has(p.access?.level),'Invalid access level: '+p.id);
 assert.match(p.links?.official_url||'',/^https:\/\//,'Official HTTPS source missing: '+p.id);
 assert.ok(p.review && ['pending','verified'].includes(p.review.status),'Invalid review status: '+p.id);
 assert.ok(Array.isArray(p.topics) && p.topics.length>0,'Missing science topics: '+p.id);
 assert.ok(Number.isFinite(p.coordinates?.lat) && Number.isFinite(p.coordinates?.lng),'Non-numeric coordinates: '+p.id);
 assert.ok(p.coordinates.lat>=25 && p.coordinates.lat<=37 && p.coordinates.lng>=-107 && p.coordinates.lng<=-93,'Institution outside broad Texas bounds: '+p.id);
 if(p.review.status==='pending')pending++;
 if(p.review.status==='verified'){
  verified++;
  assert.ok(p.review.reviewed_at,'Verified location needs a review date: '+p.id);
  assert.ok(p.review.checks?.organization_source && p.review.checks?.access_source && p.review.checks?.coordinate_source,'Verified location needs all checks: '+p.id);
 }
 if(p.coordinates.accuracy==='approximate')approximate++;
 if(p.review.checks?.coordinate_source)reviewedCoordinates++;
}
for(const e of events){
 assert.ok(ids.has(e.institution_id),'Orphan event: '+e.id);
 assert.ok(e.source_url?.startsWith('https://'),'Unproven event source: '+e.id);
 assert.ok(e.review?.status,'Missing event review: '+e.id);
}
console.log('Atlas audit PASS: '+places.length+' institutions, '+events.length+' event occurrences');
console.log('Review status: '+verified+' verified, '+pending+' pending; '+approximate+' approximate pins; '+reviewedCoordinates+' coordinate-source checks.');
console.log('Publication gate: pending records remain preliminary; passing structure checks does not certify public access or ticket availability.');
