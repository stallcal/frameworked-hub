(function () {
  'use strict';
  const form = document.getElementById('resource-filters');
  if (!form) return;
  const search = document.getElementById('resource-search');
  const topic = document.getElementById('resource-topic');
  const kind = document.getElementById('resource-kind');
  const count = document.getElementById('resource-count');
  const empty = document.getElementById('resource-empty');
  const entries = Array.from(document.querySelectorAll('[data-resource-entry]'));
  const groups = Array.from(document.querySelectorAll('[data-resource-group]'));
  const params = new URLSearchParams(window.location.search);
  if (Array.from(topic.options).some(o => o.value === params.get('topic'))) topic.value = params.get('topic');
  if (Array.from(kind.options).some(o => o.value === params.get('kind'))) kind.value = params.get('kind');
  search.value = params.get('q') || '';
  function update() {
    const q = search.value.trim().toLocaleLowerCase();
    let matches = 0;
    for (const entry of entries) {
      const topics = (entry.dataset.topics || '').split(' ');
      const text = entry.textContent.toLocaleLowerCase();
      const visible = (!q || text.includes(q)) &&
        (topic.value === 'all' || topics.includes(topic.value)) &&
        (kind.value === 'all' || kind.value === entry.dataset.kind);
      entry.hidden = !visible;
      if (visible) matches++;
    }
    for (const group of groups) {
      const visibleCount = group.querySelectorAll('[data-resource-entry]:not([hidden])').length;
      group.hidden = visibleCount === 0;
      const size = group.querySelector('.resource-group-size');
      if (size) size.textContent = visibleCount;
    }
    count.textContent = matches + (matches === 1 ? ' resource' : ' resources') + ' found';
    empty.hidden = matches !== 0;
    const query = new URLSearchParams();
    if (topic.value !== 'all') query.set('topic', topic.value);
    if (kind.value !== 'all') query.set('kind', kind.value);
    if (search.value.trim()) query.set('q', search.value.trim());
    const url = window.location.pathname + (query.toString() ? '?' + query.toString() : '');
    window.history.replaceState(null, '', url);
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => window.requestAnimationFrame(update));
  update();
})();
