
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
import re
root=Path.cwd()
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.ids=set(); self.links=[]; self.assets=[]; self.errors=[]; self.h1=0
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids: self.errors.append('duplicate id '+a['id'])
            self.ids.add(a['id'])
        if tag=='a' and 'href' in a: self.links.append(a['href'])
        if tag=='h1': self.h1+=1
        if tag=='img':
            self.assets.append(a.get('src',''))
            if 'alt' not in a: self.errors.append('missing image alt')
        if tag=='link' and a.get('rel') in ['stylesheet','icon']: self.assets.append(a.get('href',''))
failures=[]
for dirname in ['public','public-production']:
    build=root/dirname
    pages={p:Page(p.read_text(encoding='utf-8')) for p in build.rglob('*.html')}
    if not pages or not (build/'index.html').exists(): failures.append(dirname+': missing current build output')
    for path,page in pages.items():
        failures.extend(str(path)+': '+e for e in page.errors)
        if page.h1!=1: failures.append(str(path)+': expected one h1')
        for href in page.links+page.assets:
            url=urlsplit(href)
            if url.scheme or url.netloc: continue
            if not url.path: dest=path
            else:
                dest=(build/unquote(url.path).lstrip('/')) if url.path.startswith('/') else path.parent/unquote(url.path)
                if dest.is_dir() or url.path.endswith('/'): dest=dest/'index.html'
            if not dest.exists(): failures.append(str(path)+': missing '+href)
            if url.fragment and dest in pages and unquote(url.fragment) not in pages[dest].ids: failures.append(str(path)+': missing anchor '+href)
    print(dirname+': checked '+str(len(pages))+' HTML pages, local links, assets, anchors, heading counts and alt attributes')
# Discover current drafts so this check follows the editorial workflow as stories publish.
samples=[]
new_drafts=[]
for source in (root/'site-content').rglob('*.md'):
    if source.name == '_index.md': continue
    text=source.read_text(encoding='utf-8')
    frontmatter=text.split('---',2)[1]
    if not re.search(r'^draft:\s*true\s*$',frontmatter,re.M): continue
    relative=source.relative_to(root/'site-content')
    sample=str(relative.with_suffix('.html')) if source.name == 'index.md' else str(relative.with_suffix('')/'index.html')
    (samples if re.search(r'^example:\s*true\s*$',frontmatter,re.M) else new_drafts).append(sample)
    preview=root/'public'/sample
    assert preview.exists(),sample
    label='Example draft' if sample in samples else 'Working draft'
    assert label in preview.read_text(encoding='utf-8'),sample
    assert not (root/'public-production'/sample).exists(),'Draft leaked: '+sample
assert not (root/'public-production/papers/paper1/index.html').exists(),'Starter content leaked'
for p in (root/'public-production').rglob('*'):
    if p.suffix in ['.html','.xml','.json']:
        text=p.read_text(encoding='utf-8')
        if any('/'+sample.removesuffix('index.html') in text for sample in samples+new_drafts):
            failures.append('Draft URL leaked into '+str(p))
print('Draft exclusion: pages, links, sitemap and feeds checked')
for dirname in ['public','public-production']:
    home=(root/dirname/'index.html').read_text(encoding='utf-8')
    assert not any('/'+sample.removesuffix('index.html') in home for sample in samples+new_drafts),'Draft on homepage'
print('Homepage draft exclusion checked; conditional sections and series tested by test_editorial.py')
print(json.dumps({'failures':failures},indent=2))
assert not failures
