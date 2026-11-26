"""Integration tests for the rendered-site link and draft verifier."""

from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import sys
import unittest


VERIFY = Path(__file__).with_name("verify_site.py")


class VerifySiteFrontMatterTests(unittest.TestCase):
    def check_fixture(self, draft=False, leak=False):
        with TemporaryDirectory() as temp:
            root = Path(temp)
            for folder in ("public", "public-production"):
                target = root / folder / "index.html"
                target.parent.mkdir(parents=True)
                target.write_text("<!doctype html><h1>Home</h1>", encoding="utf-8")

            source = root / "site-content/tools/json-example.md"
            source.parent.mkdir(parents=True)
            source.write_text(
                '{"title":"JSON example","draft":' + ("true" if draft else "false") + '}\n\nDescription.',
                encoding="utf-8",
            )
            if draft:
                preview = root / "public/tools/json-example/index.html"
                preview.parent.mkdir(parents=True)
                preview.write_text("<h1>Draft</h1><p>Working draft</p>", encoding="utf-8")
                if leak:
                    production = root / "public-production/tools/json-example/index.html"
                    production.parent.mkdir(parents=True)
                    production.write_text("<h1>Leaked</h1>", encoding="utf-8")

            return subprocess.run(
                [sys.executable, str(VERIFY)],
                cwd=root,
                text=True,
                capture_output=True,
                check=False,
            )

    def test_json_front_matter_without_draft_does_not_crash(self):
        result = self.check_fixture()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_json_draft_is_excluded_from_production(self):
        result = self.check_fixture(draft=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_json_draft_leaking_to_production_is_rejected(self):
        result = self.check_fixture(draft=True, leak=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Draft leaked", result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
