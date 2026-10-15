---
name: security-analysis
description: Report-only security analysis of code changes and selected paths for vulnerabilities and security test gaps. Reviews untrusted input, auth, sessions, APIs, files, network calls, commands, queries, parsing, secrets, and dependencies. Supports uncommitted, staged, branch, base-ref, revision-range, and path scopes; quick, standard, deep, and focus options.
---

# Security Analysis

Report-only static security review of code changes or selected paths: report
vulnerabilities and security test gaps, never edit code.

## Flow

1. **Scope.** Resolve scope, depth, focus, and output from the arguments in the
   message that invoked this skill, and build the reviewable-file map per
   [arguments.md](references/arguments.md). Run
   [scan-static.mjs](scripts/scan-static.mjs) with Node.js:
   `--repo <repo> --mode branch|base|uncommitted|staged|range|paths`, plus
   `--base <ref>` (branch/base) or `--revision <rev>` (range), and one
   `--path <path>` per selected path or path filter. A limitation no reviewer
   completes sets `complete` to `false`.
2. **Mode.** Inspect the relevant hunks and select passes from the checklist by
   depth: `quick` (default) runs every applicable Quick pass, `standard` adds
   applicable Standard passes, and `deep` adds threat modeling, exploit
   validation, and operational readiness for the whole change. Depth never
   reduces the tracing or evidence a selected rule requires. A focus changes
   attention and report emphasis; it never removes otherwise applicable rules.
3. **Review.** Up to 20 reviewable files and 2,000 reviewable lines (changed
   lines for change scopes, selected lines for path audits) form one unit;
   anything larger must be split into units per
   [large-scope.md](references/large-scope.md). Spawn one reviewer subagent per
   unit to run the selected passes; for a large scope, one synthesis subagent
   then merges their findings. Only a returned reviewer result counts
   as review; never review yourself.
4. **Verify.** With any candidate findings or security test gaps, spawn exactly
   one verifier subagent with all of them and the full path to
   [verify-findings.md](references/verify-findings.md); never verify yourself.
   Keep each `confirmed` candidate with the verifier's corrections and drop
   each `merged` or `rejected` one. Keep any candidate whose verdict is missing
   for any reason as proposed, and set `complete` to `false`.
5. **Report.** Render the kept findings per
   [output-format.md](references/output-format.md); never relay raw subagent
   output.

Every subagent is read-only and gets the full paths to
[review-rules.md](references/review-rules.md), which it must read and follow,
and `output-format.md`, plus the resolved scope, the active depth and focus, and
user instructions. Reviewers also get their file IDs and ranges or hunks, their
scanner candidates to verify and limitations to complete, the full paths of
their selected passes, and the full path to this file for its Checklist routes
only. You follow `review-rules.md` too. Pick each subagent's model and effort by
role from [models.md](references/models.md).

If a subagent fails, times out, or returns unusable output, keep the findings
and gaps you already have or gave it as proposed, set `complete` to `false`, and
continue. Anything left unreviewed or undecided also sets `complete` to `false`.

## Checklist

Every review runs
[owasp-secure-coding-review.md](passes/owasp-secure-coding-review.md) and
[security-test-generation.md](passes/security-test-generation.md). Load other
passes only when the scoped code or a focus evidences their surface; every
applicable rule in a loaded pass is mandatory.

| Evidence or focus | Quick pass |
| --- | --- |
| Untrusted input, schema, query, command, parser, template, rendered content | [input-and-content.md](passes/input-and-content.md) |
| Login, recovery, MFA, session, cookie, JWT, OAuth/OIDC, shared auth control | [authentication-and-sessions.md](passes/authentication-and-sessions.md) |
| Object access, roles, permissions, tenant/account/workspace/org boundary, job, export, shared middleware; `focus authz` or `focus tenant-isolation` | [authorization-and-tenant-isolation.md](passes/authorization-and-tenant-isolation.md) |
| Password, token, credential, API key, private key, passphrase, cookie, auth header, PII, customer data, export, snapshot, log, telemetry, queue, cache, browser state, outbound data; `focus sensitive-data` | [sensitive-data-flow.md](passes/sensitive-data-flow.md) |
| File access, upload, archive, converter, URL fetch, outbound request | [files-and-network.md](passes/files-and-network.md) |
| API, webhook, WebSocket, browser state/rendering, cross-origin messaging | [api-and-browser.md](passes/api-and-browser.md) |
| Password, token, credential, secret, random value, encryption, signature, key | [cryptography-and-secrets.md](passes/cryptography-and-secrets.md) |
| Browser resource, infrastructure, dependency/build, or operational change | Relevant sections of [additional-topics.md](passes/additional-topics.md) |
| Unclear trust boundary, attacker goal, or abuse case; `focus threat-model` | [threat-modeling.md](passes/threat-modeling.md) |
| Plausible vulnerability needing exploitability proof or an unclear validation path | [exploit-validation.md](passes/exploit-validation.md) |
| Audit events, alerting, rollback, rotation, incident response, privileged access; `focus operational-readiness` | [operational-readiness.md](passes/operational-readiness.md) |

`focus tests` still runs the mandatory security-test pass. A changed dependency,
build script, or configuration is classified in the OWASP pass.

`standard` adds these, without rerunning equivalent Quick rules:

| Evidence | Standard pass |
| --- | --- |
| Specialized interpreter, output format, or parser | [specialized-injection.md](passes/specialized-injection.md) |
| Route, controller, handler, API schema/DTO, serializer, webhook, external API client, API version/router configuration | [api-security.md](passes/api-security.md) |
| Login, session, password, MFA, OAuth/OIDC, TLS/certificate, random token, encryption, signing or signature verification, or key code/configuration | [identity-and-cryptography.md](passes/identity-and-cryptography.md) |
| Upload, archive, converter, temporary file, download | [extended-files.md](passes/extended-files.md) |
| Encryption, signing, hashing, key derivation, or key lifecycle | [extended-cryptography.md](passes/extended-cryptography.md) |
| Dependency manifest, lockfile, registry, install/build script, build plugin, CI pipeline, or artifact configuration | [supply-chain.md](passes/supply-chain.md) |

`deep` selects every applicable Quick and Standard pass and runs threat
modeling, exploit validation, and operational readiness for the whole change.
At every depth, the last three Quick rows still trigger those passes.
