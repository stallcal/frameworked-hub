"""Exercise editorial behavior in a disposable copy, never in live content.

Run with HUGO=/path/to/hugo python3 scripts/test_editorial.py.
Only the Python standard library and the repository's pinned Hugo are required.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
HUGO = os.environ.get("HUGO", "hugo")


class EditorialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="frameworked-editorial-")
        cls.site = Path(cls.temp.name) / "site"
        shutil.copytree(ROOT, cls.site, ignore=shutil.ignore_patterns(
            ".git", "public", "public-production", "resources", ".preview", "__pycache__"))
        config = cls.site / "config.yml"
        config.write_text(config.read_text().replace(
            "startSeries: introduction-to-mofs", "startSeries: tools-and-techniques"))
        cls.write_story("test-first", order=2, date="2020-01-01", featured=True)
        cls.write_story("test-draft", order=10, date="2020-01-02", draft=True)
        cls.write_story("test-last", order=20, date="2019-01-01")
        cls.write_story("test-future", order=30, date="2999-01-01")
        for preview in (True, False):
            result = cls.build(preview)
            if result.returncode:
                raise RuntimeError(result.stdout)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    @classmethod
    def write_story(cls, slug, order, date, draft=False, featured=False):
        bundle = cls.site / "site-content/articles" / slug
        bundle.mkdir(parents=True, exist_ok=True)
        metadata = {
            "title": slug, "description": "Editorial integration fixture.",
            "draft": draft, "editorial_status": "approved", "date": date,
            "series": ["tools-and-techniques"], "series_order": order,
            "featured": featured,
            "references": [{"id": "r", "authors": "Fixture", "year": 2020,
                            "title": "Reference fixture", "url": "https://example.com/"}],
        }
        # JSON scalar values are valid YAML; avoid a Python YAML dependency.
        frontmatter = "\n".join(key + ": " + json.dumps(value) for key, value in metadata.items())
        (bundle / "index.md").write_text("---\n" + frontmatter + "\n---\n## Fixture\n"
            'A test reference. {{< cite "r" >}}\n'
            '{{< figure src="diagram.svg" alt="A test rectangle" caption="Test figure" '
            'width="120" height="80" >}}\n')
        (bundle / "diagram.svg").write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">'
            '<rect width="120" height="80" fill="#084B9E"/></svg>')

    @classmethod
    def build(cls, preview=False):
        command = [HUGO, "--environment", "preview" if preview else "production",
                   "--destination", "test-preview" if preview else "test-production",
                   "--cleanDestinationDir"]
        if preview:
            command.append("--buildDrafts")
        return subprocess.run(command, cwd=cls.site, text=True,
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    def page(self, path, preview=False):
        return (self.site / ("test-preview" if preview else "test-production") / path).read_text()

    def test_series_order_and_draft_neighbors(self):
        production = self.page("articles/test-first/index.html")
        preview = self.page("articles/test-first/index.html", True)
        self.assertRegex(production, r'rel="next" href="/articles/test-last/"')
        self.assertNotIn('/articles/test-draft/', production)
        self.assertRegex(preview, r'rel="next" href="/articles/test-draft/"')
        self.assertIn('Next → · Draft', preview)
        last = self.page("articles/test-last/index.html")
        self.assertRegex(last, r'rel="prev" href="/articles/test-first/"')
        series = self.page("series/tools-and-techniques/index.html")
        self.assertLess(series.index('/articles/test-first/'), series.index('/articles/test-last/'))

    def test_published_home_and_latest_order(self):
        for preview in (False, True):
            home = self.page("index.html", preview)
            self.assertIn('id="featured-title"', home)
            self.assertIn('id="start-title"', home)
            self.assertIn('id="latest-title"', home)
            self.assertNotIn('/articles/test-draft/', home)
            self.assertNotIn('/articles/build-with-molecules/', home)
            latest = home.split('id="latest-title"', 1)[1].split('</section>', 1)[0]
            self.assertLess(latest.index('/articles/test-first/'), latest.index('/articles/test-last/'))
        articles = self.page("articles/index.html")
        self.assertIn('/series/tools-and-techniques/', articles)
        self.assertNotIn('/series/mof-primer/', articles)
        self.assertNotIn('/series/history-of-porous-materials/', articles)

    def test_no_draft_or_future_leaks(self):
        build = self.site / "test-production"
        for path in build.rglob('*'):
            if path.suffix in ('.html', '.xml', '.json'):
                text = path.read_text()
                self.assertNotIn('/articles/test-draft/', text, str(path))
                self.assertNotIn('/articles/test-future/', text, str(path))
                self.assertNotIn('/articles/build-with-molecules/', text, str(path))
        self.assertFalse((build / 'series/mof-primer/index.html').exists())
        self.assertFalse((self.site / 'test-preview/articles/test-future/index.html').exists())

    def test_figure_resource_and_citation(self):
        text = self.page('articles/test-first/index.html')
        self.assertIn('href="#ref-r"', text)
        self.assertIn('id="ref-r"', text)
        self.assertIn('src="/articles/test-first/diagram.svg"', text)
        self.assertIn('width="120" height="80"', text)
        self.assertTrue((self.site / 'test-production/articles/test-first/diagram.svg').exists())

    def test_invalid_content_blocks_build(self):
        page = self.site / 'site-content/articles/test-first/index.md'
        original = page.read_text()
        scenarios = [
            (original.replace('editorial_status: "approved"', 'editorial_status: "needs-review"'),
             'published stories require editorial_status: approved'),
            (original.replace('series_order: 2', 'series_order: 20'), 'duplicate series_order'),
            (original.replace('tools-and-techniques', 'unknown-series'), 'unknown series'),
            (original + '\n{{< figure-placeholder number="1" title="Unfinished" >}}'
             'Not complete.{{< /figure-placeholder >}}', 'replace figure placeholders before publication'),
            (original + '\n{{< editor-note >}}Unfinished.{{< /editor-note >}}',
             'resolve editorial notes before publication'),
            (original.replace('cite "r"', 'cite "missing"'), 'Missing reference'),
        ]
        try:
            for source, expected in scenarios:
                with self.subTest(expected=expected):
                    page.write_text(source)
                    result = self.build()
                    self.assertNotEqual(result.returncode, 0, result.stdout)
                    self.assertIn(expected, result.stdout)
        finally:
            page.write_text(original)


if __name__ == '__main__':
    unittest.main(verbosity=2)
