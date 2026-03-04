---
name: security
description: Practical secure coding and security review guidance for application changes. Use when implementing or reviewing code that handles untrusted input, auth/authz, sessions, URL fetching, file upload/access, command execution, database queries, deserialization, secrets, logging, or dependency risk.
---

# Security

## Overview

Apply a fast, repeatable security review for code changes. Start with mandatory baseline controls, then run targeted checks for the risky areas touched by the change.

## Workflow

1. Classify the change surface
- Identify touched boundaries: HTTP handlers, queue consumers, CLI args, config/env, webhooks, files, database, and external network calls.
- Mark whether the change touches security-sensitive areas: auth, sessions, permissions, file access/upload, URL fetching, command execution, deserialization, or credential handling.

2. Apply baseline controls (derived from OWASP and secure coding standards)
- Treat all external input as untrusted.
- Validate and narrow data at boundaries; reject invalid input early.
- Avoid `eval`, `new Function`, and dynamic imports based on user input.
- Never construct shell commands by concatenating user input.
- Use parameterized SQL queries; never build SQL via string concatenation.
- Encode output for its rendering context to prevent XSS (HTML entity encoding, JavaScript escaping, URL encoding).
- Avoid leaking stack traces or internal errors to end users.
- Handle errors explicitly; do not silently swallow failures.
- Avoid custom authentication or cryptography; use established project libraries/patterns.
- Apply least privilege for tokens, roles, and credentials.
- Guard against SSRF when fetching user-controlled URLs.
- Block arbitrary filesystem access driven by user input.
- Minimize new dependencies; prefer established project patterns. If adding dependencies, verify package provenance and transitive risk.
- Never add secrets to source control or logs.
- Never log sensitive values (tokens, passwords, cookies, auth headers).

3. Run targeted checks for touched areas
- Input validation: Use strict schemas, allowlists, and size/format limits.
- AuthN/AuthZ: Enforce authorization server-side for every privileged action.
- Sessions/tokens: Check rotation, expiry, revocation, and secure cookie flags where relevant.
- Network calls: Enforce allowlists, timeouts, redirect policy, payload limits, and private-network blocking.
- File operations: Normalize paths, prevent traversal, and constrain read/write roots.
- File uploads: Validate type/signature, cap size, and isolate storage.
- Database access: Keep least-privilege DB roles and transactional integrity for sensitive updates.
- Command execution: Prefer native APIs. If unavoidable, use exec-style APIs with argv arrays (e.g., `execFile` not `exec`, `subprocess.run` with list not string). Never use `shell=True` with user input.
- Serialization/deserialization: Use safe parsers and strict schema validation.
- Logging/telemetry: Redact sensitive fields and avoid credential leakage.

4. Handle security-sensitive changes explicitly
- Add misuse and abuse tests for the change when feasible.
- Document security considerations in the change summary (risk, controls, residual risk).
- Flag unresolved risk with concrete follow-up actions.

5. Expand depth when needed
- Read [additional-topics.md](references/additional-topics.md) when the task needs broader security coverage (threat modeling, supply chain, runtime hardening, and operations).

## Output Delivery

- Start with scope: "Scope reviewed: <files/modules/commit range>"
- Report findings using format below, grouped by file when multiple issues in same file
- Order by severity: critical -> high -> medium -> low
- Then provide summary: "Found X issues (Y critical, Z high, M medium, L low)"
- If no issues found, report: "No security issues identified in reviewed changes"

## Review Output Format

Use this structure when reporting findings:

- Severity: `critical` | `high` | `medium` | `low`
- Area: short label (for example `ssrf`, `authz`, `secrets`)
- Evidence: file plus behavior that creates risk
- Impact: what an attacker can do
- Fix: minimal, concrete remediation
- Validation: how to verify the fix

Severity rubric:
- critical: Active compromise risk (for example auth bypass, RCE, or immediate sensitive-data exposure).
- high: Credible exploit path with significant confidentiality, integrity, or availability impact.
- medium: Real weakness with constrained exploitability or limited blast radius.
- low: Defense-in-depth or low-likelihood issue with limited impact.

Example:
- Severity: high
- Area: sql-injection
- Evidence: api/users.ts:42 - Raw string concatenation in query: `SELECT * FROM users WHERE id = '${userId}'`
- Impact: Attacker can inject SQL to read/modify arbitrary data
- Fix: Use parameterized query: `db.query('SELECT * FROM users WHERE id = $1', [userId])`
- Validation: Test with userId = `' OR '1'='1` - should fail safely
