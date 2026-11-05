// Atlas publication-gate audit: fail on invalid structure, report unverified work honestly.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('static/atlas/index.html','utf8');
function embedded(name, suffix=''){
 const result=html.match(new RegExp('^const '+name+'=(.*)'+suffix+';$','m'));
 assert.ok(result, 'Missing '+name+' inline source');
 return JSON.parse(result[1]);
}
const data=embedded('DATA');
const places=data.places;
const events=embedded('EVENTS','\\.events').events;
const roads=embedded('ROADS');
const allowedAccess=new Set(['public_venue','scheduled_public','research_campus']);
const allowedRegions=new Set(['dfw','central','houston','gulf','west','east','south','panhandle']);
assert.ok(places.length>=1 && events.length>=1,'Empty data collections');
let pending=0,verified=0,approximate=0,reviewedCoordinates=0;
const ids=new Set();
for(const p of places){
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
assert.equal(roads.source?.includes('TxDOT'),true,'Road source attribution missing');
assert.match(roads.source_url,/^https:\/\//,'Road source URL must be HTTPS');
assert.ok(roads.roads.length>0,'No embedded road routes');
assert.match(html,/TIGERweb/,'Census road source attribution missing');
// Road viewport regression: a zoomed-in map must request the entire visible
// extent, with padding, and refresh when it moves outside loaded coverage.
const geoStart=html.indexOf('function geographicViewport(){');
const geoEnd=html.indexOf('function streetStatus(',geoStart);
assert.ok(geoStart>=0&&geoEnd>geoStart,'Road viewport calculations found');
const snippets=html.slice(geoStart,geoEnd);
const v={x:850,y:350,w:4,h:3.56};
const f=new Function('view', snippets+'\nreturn {geographicViewport,paddedViewport,bboxContains};')(v);
const viewBounds=f.geographicViewport(),requested=f.paddedViewport(viewBounds);
assert.ok(f.bboxContains(requested,viewBounds),'Request must cover all visible streets');
v.x+=v.w*.8;
assert.equal(f.bboxContains(requested,f.geographicViewport()),false,'Panning far should trigger new road request');
assert.ok(html.includes("layer:0,element:'censusPrimaryLayer'"),'Primary layer missing');
assert.ok(html.includes("layer:1,element:'censusSecondaryLayer'"),'Secondary layer missing');
assert.ok(html.includes("layer:2,element:'streetLayer'"),'Local layer missing');
assert.ok(html.includes("resultOffset:String(page*cfg.pageSize)"),'Road pagination missing');
console.log('Atlas audit PASS: '+places.length+' institutions, '+events.length+' event occurrences, '+roads.roads.length+' embedded TxDOT routes');
console.log('Review status: '+verified+' verified, '+pending+' pending; '+approximate+' approximate pins; '+reviewedCoordinates+' coordinate-source checks.');
console.log('Geographic road loading: complete viewport, pan refresh, 3 service layers and pagination checked.');
console.log('Publication gate: pending records remain preliminary; passing structure checks does not certify public access or ticket availability.');
