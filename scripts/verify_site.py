
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
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
samples=['learn/what-is-a-mof/index.html','articles/reading-a-mof-paper/index.html','explore/mof-5/index.html']
for sample in samples:
    p=root/'public'/sample
    assert p.exists(),sample
    assert 'Example draft' in p.read_text(encoding='utf-8'),sample
    assert not (root/'public-production'/sample).exists(),'Draft leaked: '+sample
new_drafts=['learn/mof-definition/index.html','articles/water-harvesting/index.html','articles/pfas-groundwater/index.html']
for sample in new_drafts:
    p=root/'public'/sample
    assert p.exists(),sample
    assert 'Working draft' in p.read_text(encoding='utf-8'),sample
    assert not (root/'public-production'/sample).exists(),'Draft leaked: '+sample
assert not (root/'public-production/papers/paper1/index.html').exists(),'Starter content leaked'
for p in (root/'public-production').rglob('*'):
    if p.suffix in ['.html','.xml','.json']:
        text=p.read_text(encoding='utf-8')
        if any('/'+sample.removesuffix('index.html') in text for sample in samples+new_drafts):
            failures.append('Draft URL leaked into '+str(p))
print('Draft exclusion: pages, links, sitemap and feeds checked')
print(json.dumps({'failures':failures},indent=2))
assert not failures
