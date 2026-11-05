// Regression test: All access must contain restricted events and all public events.
// No browser packages or network connections required.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('static/atlas/index.html', 'utf8');
function embedded(name, suffix='') {
  const match = html.match(new RegExp('^const ' + name + '=(.*)' + suffix + ';$', 'm'));
  assert.ok(match, name + ' is embedded in the Atlas');
  return JSON.parse(match[1]);
}
const places = embedded('DATA').places;
const events = embedded('EVENTS', '\\.events').events;
const firstAccessOption = html.match(/<select id="eventAccess"[^>]*>\s*<option value="([^"]+)"([^>]*)>/);
assert.ok(firstAccessOption, 'event access filter exists');
assert.equal(firstAccessOption[1], 'all', 'All access must be the first/default option');
assert.match(firstAccessOption[2], /selected/, 'All access must be explicitly selected');
assert.match(html, /All access — including restricted/, 'access filter should be unambiguous');
const start = html.indexOf('function filteredEvents(){');
const end = html.indexOf('\nfunction changeMonth(', start);
assert.ok(start >= 0 && end > start, 'calendar filtering function found');
const predicate = html.slice(start, end);
const run = new Function('$', 'EVENTS', 'institutionFor', predicate + '\nreturn filteredEvents()');
const institutionFor = event => places.find(p => p.id === event.institution_id);
function query({region='all', type='all', access='all', search=''}) {
  const values = {eventRegion:region, eventType:type, eventAccess:access, eventSearch:search};
  return run(id => ({value:values[id]}), events, institutionFor);
}
const regions = ['all', ...new Set(places.map(p => p.region))];
const categories = ['all', ...new Set(events.map(e => e.category))];
let checked = 0, restrictedSeen = 0;
for (const region of regions) for(const type of categories) {
  const all = query({region, type, access:'all'});
  const publicEntries = query({region, type, access:'public'});
  const restricted = query({region, type, access:'restricted'});
  const allIds = new Set(all.map(e => e.id));
  assert.equal(allIds.size, all.length, 'No duplicate event IDs');
  assert.equal(all.length, publicEntries.length + restricted.length,
    region + ' / ' + type + ': All must include both access groups');
  for (const e of [...restricted, ...publicEntries]) {
    assert.ok(allIds.has(e.id), 'All is missing ' + e.id + ' in ' + region + ' / ' + type);
  }
  restrictedSeen += restricted.length;
  checked++;
}
assert.ok(restrictedSeen > 0, 'Regression fixture must include restricted events');
const defaultAllDays = new Set(query({}).map(e => e.start_at.slice(0,10)));
for (const e of query({access:'restricted'})) {
  assert.ok(defaultAllDays.has(e.start_at.slice(0,10)),
    'Restricted-only date missing from All calendar: ' + e.start_at.slice(0,10));
}
console.log('Calendar access regression PASS:', checked, 'region/type combinations,',
  events.length, 'events; all includes restricted.');
