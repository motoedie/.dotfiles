#!/usr/bin/env python3
"""Report deterministic structure and approximate context costs for an Agent Skill."""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$", re.M)
TEXT_SUFFIXES = {".md", ".yaml", ".yml", ".json", ".txt"}
SKIP_PARTS = {"__pycache__", ".git", ".DS_Store"}
RISK_PATTERNS = (
    ("piped-shell", re.compile(r"\bcurl\b[^\n|]*\|\s*(?:ba)?sh\b", re.I), "downloads content directly into a shell"),
    ("recursive-delete", re.compile(r"\brm\s+-[^\n]*r[^\n]*f|\brm\s+-[^\n]*f[^\n]*r", re.I), "contains a recursive forced delete command"),
    ("environment-dump", re.compile(r"(?:^|[;&|]\s*)(?:printenv|env)(?:\s|$)", re.M), "may dump environment variables"),
)


@dataclass(order=True)
class Finding:
    severity: str
    code: str
    file: str
    line: int
    message: str


def estimate_tokens(text: str) -> int:
    """Use a transparent tokenizer-independent approximation."""
    return math.ceil(len(text) / 4) if text else 0


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as error:
        raise ValueError(f"cannot read {path}: {error}") from error


def split_frontmatter(text: str) -> tuple[str, str, int]:
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return "", text, 0
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            return "".join(lines[1:index]), "".join(lines[index + 1 :]), index + 1
    return "", text, 0


def frontmatter_values(frontmatter: str) -> dict[str, str]:
    values: dict[str, str] = {}
    lines = frontmatter.splitlines()
    index = 0
    while index < len(lines):
        match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", lines[index])
        if not match:
            index += 1
            continue
        key, raw = match.groups()
        if raw in {">", ">-", "|", "|-"}:
            chunks: list[str] = []
            index += 1
            while index < len(lines) and (not lines[index].strip() or lines[index][:1].isspace()):
                chunks.append(lines[index].strip())
                index += 1
            values[key] = " ".join(chunk for chunk in chunks if chunk)
            continue
        values[key] = raw.strip().strip("'\"")
        index += 1
    return values


def relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def is_text_file(path: Path) -> bool:
    return path.suffix.lower() in TEXT_SUFFIXES or path.name == "SKILL.md"


def package_files(root: Path) -> tuple[list[Path], list[dict[str, str]]]:
    files: list[Path] = []
    excluded: list[dict[str, str]] = []

    def raise_walk_error(error: OSError) -> None:
        raise ValueError(f"cannot enumerate {root}: {error}") from error

    for directory, directories, filenames in os.walk(root, onerror=raise_walk_error):
        parent = Path(directory)
        for name in sorted(directories):
            if name in SKIP_PARTS:
                excluded.append({
                    "file": relative(parent / name, root),
                    "reason": "version-control internals" if name == ".git" else "generated cache",
                })
        directories[:] = sorted(name for name in directories if name not in SKIP_PARTS)
        for name in sorted(filenames):
            path = parent / name
            if name in SKIP_PARTS:
                excluded.append({
                    "file": relative(path, root),
                    "reason": "version-control internals" if name == ".git" else "generated cache",
                })
            elif path.is_file():
                files.append(path)
    return sorted(files), sorted(excluded, key=lambda item: item["file"])


def text_files(root: Path) -> list[Path]:
    files, _ = package_files(root)
    return [path for path in files if is_text_file(path)]


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def local_link_target(raw_target: str) -> str | None:
    target = raw_target.strip().split(maxsplit=1)[0].strip("<>")
    if not target or target.startswith(("#", "http://", "https://", "mailto:")):
        return None
    return target.split("#", 1)[0]


def paragraphs(text: str) -> Iterable[tuple[int, str]]:
    in_fence = False
    block: list[str] = []
    start = 1
    for number, line in enumerate(text.splitlines(), start=1):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            if block:
                yield start, " ".join(block)
                block = []
            continue
        stripped = line.strip()
        if in_fence or not stripped or stripped.startswith(("#", "- ", "* ", ">", "|")):
            if block:
                yield start, " ".join(block)
                block = []
            continue
        if not block:
            start = number
        block.append(stripped)
    if block:
        yield start, " ".join(block)


def analyze(root: Path) -> dict[str, object]:
    findings: list[Finding] = []
    skill_file = root / "SKILL.md"
    if not root.is_dir():
        raise ValueError(f"not a skill directory: {root}")
    if not skill_file.is_file():
        raise ValueError(f"missing required file: {skill_file}")

    skill_text = read_text(skill_file)
    frontmatter, body, frontmatter_end = split_frontmatter(skill_text)
    values = frontmatter_values(frontmatter)
    name = values.get("name", "")
    description = values.get("description", "")

    if not frontmatter:
        findings.append(Finding("error", "frontmatter", "SKILL.md", 1, "missing or unterminated YAML frontmatter"))
    if not name:
        findings.append(Finding("error", "name", "SKILL.md", 1, "missing name frontmatter"))
    elif not NAME_RE.fullmatch(name):
        findings.append(Finding("error", "name-format", "SKILL.md", 2, "name must use lowercase letters, digits, and hyphens"))
    if name and name != root.name:
        findings.append(Finding("error", "name-directory", "SKILL.md", 2, f"name '{name}' does not match directory '{root.name}'"))
    if not description:
        findings.append(Finding("error", "description", "SKILL.md", 1, "missing description frontmatter"))
    elif len(description) > 600:
        findings.append(Finding("warning", "description-size", "SKILL.md", 3, "description is unusually long for discovery context"))

    package_paths, excluded_paths = package_files(root)
    files = [path for path in package_paths if is_text_file(path)]
    file_text: dict[Path, str] = {}
    for path in files:
        try:
            file_text[path] = read_text(path)
        except ValueError as error:
            findings.append(Finding("error", "read", relative(path, root), 1, str(error)))

    linked_paths: set[str] = set()
    external_dependencies: dict[Path, dict[str, object]] = {}
    for path, text in file_text.items():
        for match in LINK_RE.finditer(text):
            target = local_link_target(match.group(1))
            if target is None:
                continue
            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                findings.append(Finding("error", "broken-link", relative(path, root), line_number(text, match.start()), f"missing local target: {target}"))
            try:
                rel_target = resolved.relative_to(root.resolve()).as_posix()
            except ValueError:
                if resolved.is_file() and is_text_file(resolved) and resolved not in external_dependencies:
                    dependency: dict[str, object] = {
                        "file": Path(os.path.relpath(resolved, root)).as_posix(),
                        "estimated_tokens": None,
                    }
                    external_dependencies[resolved] = dependency
                    try:
                        dependency["estimated_tokens"] = estimate_tokens(read_text(resolved))
                    except ValueError as error:
                        findings.append(Finding("error", "read", relative(path, root), line_number(text, match.start()), str(error)))
                continue
            linked_paths.add(rel_target)

    for path in package_paths:
        if path.relative_to(root).parts[0] in {"references", "scripts"} and relative(path, root) not in linked_paths:
            findings.append(Finding("warning", "unrouted-resource", relative(path, root), 1, "resource is not linked from skill documentation"))

    seen_paragraphs: dict[str, list[tuple[str, int]]] = defaultdict(list)
    for path, text in file_text.items():
        if path.suffix.lower() != ".md":
            continue
        for number, paragraph in paragraphs(text):
            normalized = re.sub(r"\W+", " ", paragraph.lower()).strip()
            if len(normalized) >= 120:
                seen_paragraphs[normalized].append((relative(path, root), number))
        for code, pattern, message in RISK_PATTERNS:
            for match in pattern.finditer(text):
                findings.append(Finding("warning", code, relative(path, root), line_number(text, match.start()), message))

    for locations in seen_paragraphs.values():
        if len(locations) > 1:
            rendered = ", ".join(f"{path}:{line}" for path, line in locations)
            first_path, first_line = locations[0]
            findings.append(Finding("warning", "duplicate-prose", first_path, first_line, f"same long paragraph appears at {rendered}"))

    if re.search(r"read (?:all|every) references?", skill_text, re.I):
        findings.append(Finding("warning", "eager-references", "SKILL.md", 1, "entrypoint may load every reference instead of routing conditionally"))

    sections: list[dict[str, object]] = []
    matches = list(HEADING_RE.finditer(body))
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        section_text = body[match.start() : end]
        sections.append({
            "heading": match.group(2),
            "level": len(match.group(1)),
            "line": frontmatter_end + line_number(body, match.start()),
            "estimated_tokens": estimate_tokens(section_text),
        })

    resources = []
    for path, text in file_text.items():
        if path == skill_file:
            continue
        resources.append({"file": relative(path, root), "estimated_tokens": estimate_tokens(text)})

    severity_rank = {"error": 0, "warning": 1, "info": 2}
    findings.sort(key=lambda item: (severity_rank[item.severity], item.file, item.line, item.code))
    return {
        "skill": name or root.name,
        "path": str(root),
        "costs": {
            "discovery_estimated_tokens": estimate_tokens(f"{name} {description}"),
            "activation_body_estimated_tokens": estimate_tokens(body),
            "skill_file_estimated_tokens": estimate_tokens(skill_text),
            "conditional_resources_estimated_tokens": sum(item["estimated_tokens"] for item in resources),
            "external_dependencies_estimated_tokens": sum(item["estimated_tokens"] or 0 for item in external_dependencies.values()),
            "method": "ceil(UTF-8 text characters / 4); approximation only",
        },
        "package_files": [
            {
                "file": relative(path, root),
                "type": "symlink" if path.is_symlink() else path.suffix.lower().lstrip(".") or "file",
                "text_analysis": is_text_file(path),
            }
            for path in package_paths
        ],
        "excluded_paths": excluded_paths,
        "external_dependencies": sorted(external_dependencies.values(), key=lambda item: str(item["file"])),
        "sections": sections,
        "resources": sorted(resources, key=lambda item: (-int(item["estimated_tokens"]), str(item["file"]))),
        "findings": [asdict(item) for item in findings],
    }


def render_text(report: dict[str, object]) -> str:
    costs = report["costs"]
    lines = [
        f"Skill: {report['skill']}",
        f"Path: {report['path']}",
        f"Package inventory: {len(report['package_files'])} files ({sum(item['text_analysis'] for item in report['package_files'])} analyzed as text)",
        "Estimated context costs:",
        f"  discovery: {costs['discovery_estimated_tokens']} tokens",
        f"  activation body: {costs['activation_body_estimated_tokens']} tokens",
        f"  complete SKILL.md: {costs['skill_file_estimated_tokens']} tokens",
        f"  all conditional resources: {costs['conditional_resources_estimated_tokens']} tokens",
        f"  external document dependencies: {costs['external_dependencies_estimated_tokens']} tokens",
        "Largest entrypoint sections:",
    ]
    sections = sorted(report["sections"], key=lambda item: -int(item["estimated_tokens"]))
    lines.extend(f"  {item['estimated_tokens']:>5}  line {item['line']}: {item['heading']}" for item in sections[:8])
    lines.append("Conditional resources:")
    resources = report["resources"]
    lines.extend(f"  {item['estimated_tokens']:>5}  {item['file']}" for item in resources)
    if not resources:
        lines.append("      0  none")
    lines.append("External document dependencies:")
    dependencies = report["external_dependencies"]
    lines.extend(f"  {str(item['estimated_tokens']) if item['estimated_tokens'] is not None else 'unknown':>5}  {item['file']}" for item in dependencies)
    if not dependencies:
        lines.append("      0  none")
    lines.append("Excluded paths:")
    lines.extend(f"  {item['file']} - {item['reason']}" for item in report["excluded_paths"])
    if not report["excluded_paths"]:
        lines.append("  none")
    lines.append("Findings:")
    findings = report["findings"]
    lines.extend(f"  {item['severity'].upper():<7} {item['code']} {item['file']}:{item['line']} - {item['message']}" for item in findings)
    if not findings:
        lines.append("  none")
    lines.append(f"Method: {costs['method']}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_directory", type=Path)
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args()
    try:
        report = analyze(args.skill_directory.expanduser().resolve())
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    if args.format == "json":
        print(json.dumps(report, indent=2))
    else:
        print(render_text(report))
    return 1 if any(item["severity"] == "error" for item in report["findings"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
