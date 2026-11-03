"""Copy standalone tool distributions into Hugo's ignored static output directories.

Source of truth: projects/<name>/web. Do not edit static/tools generated copies.
Uses only Python's standard library. Never removes the existing Scherrer directory.
"""
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]


def main():
    manifest = json.loads((ROOT / 'projects/manifest.json').read_text())
    seen = set()
    for tool in manifest['tools']:
        name, project = tool['id'], tool['project']
        if name not in {'bragg', 'adsorption', 'pore-accessibility'} or name in seen:
            raise ValueError('Unknown or duplicate tool output: ' + name)
        seen.add(name)
        source = (ROOT / 'projects' / project / 'web').resolve()
        if not source.is_relative_to(ROOT / 'projects') or not (source / 'index.html').is_file():
            raise ValueError('Invalid source for ' + name)
        package = json.loads((source.parent / 'package.json').read_text())
        if package['version'] != tool['version']:
            raise ValueError('Manifest/package version mismatch for ' + name)
        target = ROOT / 'static/tools' / name
        if target.is_symlink():
            raise ValueError('Refusing symlink output ' + str(target))
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(source, target)
        print(f"Staged {project} {tool['version']} → /tools/{name}/")


if __name__ == '__main__':
    main()
