import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import analyze_skill


class AnalyzeSkillTests(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name) / "example"
        self.root.mkdir()
        self.write_skill()

    def write(self, relative_path, contents):
        path = self.root / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(contents, bytes):
            path.write_bytes(contents)
        else:
            path.write_text(contents, encoding="utf-8")
        return path

    def write_skill(self, body="Review the selected inputs.\n"):
        return self.write(
            "SKILL.md",
            "---\nname: example\ndescription: Review selected inputs.\n---\n\n" + body,
        )

    def run_cli(self, *arguments):
        stdout = io.StringIO()
        stderr = io.StringIO()
        with mock.patch.object(sys, "argv", ["analyze_skill.py", *arguments]):
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                status = analyze_skill.main()
        return status, stdout.getvalue(), stderr.getvalue()

    def test_missing_sibling_is_a_broken_link_and_cli_error(self):
        self.write_skill("Read [the guide](../missing/SKILL.md).\n")
        status, output, stderr = self.run_cli(str(self.root), "--format", "json")
        self.assertEqual(status, 1)
        self.assertEqual(stderr, "")
        findings = json.loads(output)["findings"]
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["code"], "broken-link")
        self.assertEqual(findings[0]["file"], "SKILL.md")
        self.assertEqual(findings[0]["line"], 6)

    def test_sibling_document_is_counted_once_across_references(self):
        contents = "A shared writing guide.\n"
        self.write("../guide/SKILL.md", contents)
        self.write_skill("Read [guide](../guide/SKILL.md) and [again](../guide/SKILL.md#rules).\n")
        self.write("references/notes.md", "Use [guide](../../guide/SKILL.md).\n")
        report = analyze_skill.analyze(self.root)
        self.assertEqual(report["external_dependencies"], [
            {"file": "../guide/SKILL.md", "estimated_tokens": analyze_skill.estimate_tokens(contents)},
        ])
        self.assertEqual(
            report["costs"]["external_dependencies_estimated_tokens"],
            analyze_skill.estimate_tokens(contents),
        )
        self.assertNotIn("../guide/SKILL.md", [item["file"] for item in report["resources"]])

    def test_sibling_documents_are_not_scanned_recursively(self):
        contents = "Read [other](../absent.md) and [self](SKILL.md).\n"
        self.write("../guide/SKILL.md", contents)
        self.write("../guide/unlinked.md", "Unused sibling document.\n")
        self.write_skill("Read [guide](../guide/SKILL.md) and [self](SKILL.md).\n")
        report = analyze_skill.analyze(self.root)
        self.assertEqual(report["findings"], [])
        self.assertEqual(len(report["external_dependencies"]), 1)

    def test_sibling_symlink_aliases_share_one_cost(self):
        guide = self.write("../guide/SKILL.md", "A shared writing guide.\n")
        self.write("../alias/.keep", "")
        (self.root.parent / "alias" / "SKILL.md").symlink_to(guide)
        self.write_skill("Read [guide](../guide/SKILL.md) and [alias](../alias/SKILL.md).\n")
        report = analyze_skill.analyze(self.root)
        self.assertEqual(len(report["external_dependencies"]), 1)
        self.assertEqual(report["external_dependencies"][0]["file"], "../guide/SKILL.md")

    def test_external_binary_is_checked_without_reading_as_text(self):
        self.write("../guide/logo.png", b"\x89PNG\xff")
        self.write_skill("Inspect [logo](../guide/logo.png).\n")
        report = analyze_skill.analyze(self.root)
        self.assertEqual(report["findings"], [])
        self.assertEqual(report["external_dependencies"], [])

    def test_unreadable_external_document_has_a_read_error(self):
        self.write("../guide/SKILL.md", b"\xff\xfe")
        self.write_skill("Read [guide](../guide/SKILL.md).\n")
        report = analyze_skill.analyze(self.root)
        self.assertEqual(report["findings"][0]["code"], "read")
        self.assertEqual(report["findings"][0]["file"], "SKILL.md")
        self.assertIsNone(report["external_dependencies"][0]["estimated_tokens"])

    def test_remote_links_and_anchors_remain_ignored(self):
        self.write_skill("Use [web](https://example.com/guide), [mail](mailto:a@example.com), [anchor](#here).\n")
        report = analyze_skill.analyze(self.root)
        self.assertEqual(report["findings"], [])
        self.assertEqual(report["external_dependencies"], [])

    def test_existing_internal_link_and_cost_fields_are_preserved(self):
        skill = self.write_skill("Read [rules](references/rules.md).\n").read_text()
        rules = "Apply the repository-specific checks.\n"
        self.write("references/rules.md", rules)
        report = analyze_skill.analyze(self.root)
        _, body, _ = analyze_skill.split_frontmatter(skill)
        self.assertEqual(report["costs"]["discovery_estimated_tokens"],
                         analyze_skill.estimate_tokens("example Review selected inputs."))
        self.assertEqual(report["costs"]["activation_body_estimated_tokens"],
                         analyze_skill.estimate_tokens(body))
        self.assertEqual(report["costs"]["skill_file_estimated_tokens"],
                         analyze_skill.estimate_tokens(skill))
        self.assertEqual(report["costs"]["conditional_resources_estimated_tokens"],
                         analyze_skill.estimate_tokens(rules))
        self.assertEqual(report["resources"], [
            {"file": "references/rules.md", "estimated_tokens": analyze_skill.estimate_tokens(rules)},
        ])
        self.assertEqual(report["findings"], [])

    def test_missing_internal_link_still_fails(self):
        self.write_skill("Read [missing](references/missing.md).\n")
        status, output, _ = self.run_cli(str(self.root), "--format", "json")
        self.assertEqual(status, 1)
        self.assertEqual(json.loads(output)["findings"][0]["code"], "broken-link")

    def test_inventory_contains_sources_assets_and_extensionless_files(self):
        self.write("scripts/helper.py", "print('ok')\n")
        self.write("scripts/helper.mjs", "export const value = 1;\n")
        self.write("assets/icon.png", b"\x89PNG\xff")
        self.write("references/nested/rules.md", "Review nested rules.\n")
        self.write("NOTICE", "Attribution\n")
        report = analyze_skill.analyze(self.root)
        inventory = {item["file"]: item for item in report["package_files"]}
        self.assertEqual(set(inventory), {
            "SKILL.md", "scripts/helper.py", "scripts/helper.mjs",
            "assets/icon.png", "references/nested/rules.md", "NOTICE",
        })
        self.assertEqual(inventory["scripts/helper.py"]["type"], "py")
        self.assertFalse(inventory["scripts/helper.py"]["text_analysis"])
        self.assertFalse(inventory["assets/icon.png"]["text_analysis"])
        self.assertEqual(inventory["NOTICE"]["type"], "file")
        self.assertTrue(inventory["references/nested/rules.md"]["text_analysis"])
        self.assertEqual(analyze_skill.text_files(self.root), [
            self.root / "SKILL.md", self.root / "references/nested/rules.md",
        ])

    def test_generated_and_git_exclusions_are_recorded(self):
        self.write(".git/config", "Git internals\n")
        self.write("scripts/__pycache__/helper.pyc", b"cache")
        self.write(".DS_Store", b"metadata")
        report = analyze_skill.analyze(self.root)
        self.assertEqual([item["file"] for item in report["package_files"]], ["SKILL.md"])
        self.assertEqual(report["excluded_paths"], [
            {"file": ".DS_Store", "reason": "generated cache"},
            {"file": ".git", "reason": "version-control internals"},
            {"file": "scripts/__pycache__", "reason": "generated cache"},
        ])

    def test_ancestor_names_do_not_exclude_the_package(self):
        root = self.root / "__pycache__" / "example"
        root.mkdir(parents=True)
        (root / "SKILL.md").write_text(self.write_skill().read_text())
        report = analyze_skill.analyze(root)
        self.assertEqual([item["file"] for item in report["package_files"]], ["SKILL.md"])

    def test_large_inventory_is_complete_and_stable(self):
        for number in range(200):
            self.write(f"assets/item-{number:03}.bin", bytes([number]))
        first = analyze_skill.analyze(self.root)
        second = analyze_skill.analyze(self.root)
        self.assertEqual(first, second)
        self.assertEqual(len(first["package_files"]), 201)
        self.assertEqual(first["costs"]["conditional_resources_estimated_tokens"], 0)

    def test_symlinked_files_are_listed_without_following_directory_links(self):
        target = self.write("assets/target.bin", b"data")
        (self.root / "asset-link.bin").symlink_to(target)
        (self.root / "directory-link").symlink_to(target.parent, target_is_directory=True)
        report = analyze_skill.analyze(self.root)
        inventory = {item["file"]: item for item in report["package_files"]}
        self.assertEqual(set(inventory), {"SKILL.md", "asset-link.bin", "assets/target.bin"})
        self.assertEqual(inventory["asset-link.bin"]["type"], "symlink")

    def test_invalid_packages_keep_usage_error_status(self):
        for root in (self.root / "missing", self.root / "empty"):
            with self.subTest(root=root):
                if root.name == "empty":
                    root.mkdir()
                status, stdout, stderr = self.run_cli(str(root))
                self.assertEqual(status, 2)
                self.assertEqual(stdout, "")
                self.assertTrue(stderr.startswith("error: "))

    def test_failed_enumeration_does_not_return_partial_inventory(self):
        def failed_walk(root, onerror):
            yield str(root), [], ["SKILL.md"]
            onerror(PermissionError("unreadable nested directory"))

        with mock.patch.object(analyze_skill.os, "walk", side_effect=failed_walk):
            status, stdout, stderr = self.run_cli(str(self.root), "--format", "json")
        self.assertEqual(status, 2)
        self.assertEqual(stdout, "")
        self.assertIn("cannot enumerate", stderr)

    def test_text_cli_shows_inventory_and_external_estimates(self):
        self.write("../guide/SKILL.md", "A shared guide.\n")
        self.write_skill("Read [guide](../guide/SKILL.md).\n")
        status, stdout, stderr = self.run_cli(str(self.root))
        self.assertEqual(status, 0)
        self.assertEqual(stderr, "")
        self.assertIn("Package inventory: 1 files", stdout)
        self.assertIn("External document dependencies:", stdout)
        self.assertIn("../guide/SKILL.md", stdout)


if __name__ == "__main__":
    unittest.main()
