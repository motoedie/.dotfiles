#!/usr/bin/env bash
# Codex does not load a skill folder that has no plugin manifest, and
# mattpocock/skills ships its skills only as one bundle plugin. This wraps single
# upstream skills into plugins (skills/<name>/ + manifest) and writes a Codex
# marketplace for them. Claude and Cursor use git-subdir entries in their
# marketplace files at the repo root.
#
#   build_mattpocock_plugins.sh <out-dir>
set -euo pipefail

out=${1:?usage: build_mattpocock_plugins.sh <out-dir>}
repo=https://github.com/mattpocock/skills.git
# grilling is needed by grill-me; retro uses writing-for-agents.
skills="productivity/writing-for-agents engineering/retro productivity/grill-me productivity/grilling"

src=$(mktemp -d)
trap 'rm -rf "$src"' EXIT
git clone --quiet --depth 1 --filter=blob:none --sparse "$repo" "$src"
# shellcheck disable=SC2086
git -C "$src" sparse-checkout set .claude-plugin $(printf 'skills/%s ' $skills)

rm -rf "$out"
mkdir -p "$out/.agents/plugins"
for skill in $skills; do
  name=${skill#*/}
  mkdir -p "$out/$name/skills"
  cp -R "$src/skills/$skill" "$out/$name/skills/$name"
done

python3 - "$src" "$out" $skills <<'PY'
import json, subprocess, sys
from pathlib import Path

src, out, skills = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
upstream = json.loads((src / ".claude-plugin/plugin.json").read_text())
sha = subprocess.check_output(["git", "-C", src, "rev-parse", "--short", "HEAD"], text=True).strip()
# Clients cache plugins by version; the upstream commit makes every update a new version.
version = f"{upstream['version']}+{sha}"

def write(path, data):
    path.write_text(json.dumps(data, indent=2) + "\n")

entries = []
for skill in skills:
    name = skill.split("/", 1)[1]
    manifest = {"name": name, "version": version,
                "description": f"Matt Pocock's {name} skill only (mattpocock/skills).",
                "author": {"name": "Matt Pocock"}}
    write(out / name / "plugin.json",
          {"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json", **manifest,
           "skills": "./skills/"})
    entries.append({"name": name, "source": {"source": "local", "path": f"./{name}"},
                    "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
                    "category": "Productivity"})

write(out / ".agents/plugins/marketplace.json",
      {"name": "motoedie-mattpocock", "interface": {"displayName": "motoedie mattpocock"},
       "plugins": entries})
print(f"Built {len(entries)} plugins from mattpocock/skills@{sha} in {out}")
PY
