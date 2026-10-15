# Security Test Generation

## Report As

Report missing abuse coverage as a security test gap, not as a vulnerability,
unless the reviewed code also shows an exploitable weakness. Each gap must name
the behavior, the abuse case, and the test level to add.

## Security Test Gaps

- For each security-sensitive area touched, identify what misuse or abuse cases
  are not covered by the current test suite.
- Flag security-sensitive code paths with no test coverage.
- Suggest concrete abuse-case tests where gaps exist.

## Abuse-Case Test Design

- For each security-sensitive behavior, propose concrete abuse-case tests.
- Prefer tests that exercise the actual boundary: API/integration tests for
  authorization and validation, unit tests for pure sanitizers or policy
  helpers, E2E tests only for browser-specific security behavior.
- Include negative tests for malformed input, missing permissions, wrong tenant,
  replayed/stale token, path traversal, oversized payloads, unsafe redirects,
  blocked private-network URLs, and unauthorized export/download access when
  relevant.
- Distinguish test gaps from confirmed vulnerabilities.
