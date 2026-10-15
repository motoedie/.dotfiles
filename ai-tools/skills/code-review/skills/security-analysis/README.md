# Security Analysis

Review code changes for security problems and missing security tests. Analysis
reports findings but does not edit code.

## Quick start

| Command | Review |
| --- | --- |
| `security-analysis` | Quick review of the current branch against its detected base, including staged, unstaged, and non-ignored untracked changes |
| `security-analysis standard` | Quick plus specialized rules for the changed security surfaces |
| `security-analysis deep` | Standard plus threat modeling, exploit validation, and operational readiness |

Quick is the default review. Each mode traces every selected rule
through the full relevant code path; Standard and Deep add rule tiers. These
reviews use OWASP Top 10:2025 with code-reviewable ASVS 5.0.0 controls, without
claiming ASVS compliance.

Generated files and build output are not reviewed. Lockfile changes remain
available only for supply-chain checks. Reviews above 20 files or 2,000 lines
are split into related groups and combined into one verified report.

## Choose the scope

| Argument | Scope |
| --- | --- |
| `uncommitted` | Staged, unstaged, and non-ignored untracked changes |
| `staged` | Staged changes only |
| `<path>` | One or more files or directories |
| `<revision>` or `<revision range>` | An explicit Git revision or range |
| `base <ref>` | Current branch compared with another base branch |

Depth and scope can be combined.

Example: `security-analysis base main services/api standard`

## Focus

Use `focus <name>` to emphasize one area without disabling other applicable
checks.

Supported names:

- `authz`
- `tenant-isolation`
- `sensitive-data`
- `tests`
- `threat-model`
- `operational-readiness`

Example: `security-analysis uncommitted focus authz`
