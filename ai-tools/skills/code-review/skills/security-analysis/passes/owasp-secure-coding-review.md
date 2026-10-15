# OWASP Secure Coding Review

Use OWASP Top 10:2025 as the vulnerability model and code-reviewable ASVS
5.0.0 controls as precise checks. This is neither an ASVS compliance audit nor
evidence of ASVS compliance. Apply each selected rule completely; depth adds
rule tiers, not confidence or tracing limits.

## Classify the change

- Map changed entry points, trust boundaries, external inputs, sensitive data,
  dangerous sinks, callers, and newly reachable routes, events, middleware, and
  security-sensitive exports.
- Detect authentication, authorization, sessions, files, databases, commands,
  network calls, parsers, browser state, jobs, configuration, feature flags,
  dependencies, and build changes from code evidence, not filenames alone.
- Trace every applicable rule through the complete relevant path: entry points,
  middleware, callers and callees, services, database access, schemas,
  configuration, background jobs, and tests.

## Cross-cutting Quick checks

- Treat external input and external-service responses as untrusted. Fail closed
  on authentication and policy errors; check partial sensitive updates and
  resource cleanup on failures and timeouts.
- Enforce least privilege for roles, runtime identities, credentials, and keys.
  Reject production debug settings and default privileged credentials when
  committed configuration controls them.
- Prevent stack traces and internal details in user-visible errors. Redact
  passwords, tokens, cookies, authorization headers, and other secrets from
  logs and telemetry; prevent log injection.
- Emit audit events for security-sensitive operations when reviewed code owns
  them. Review security-sensitive migrations for inconsistent permission or
  sensitive-data state during rollout and rollback.
- Preserve transactional integrity and atomic sensitive updates. Check races,
  TOCTOU, skipped or reordered steps, replay, quota bypass, and harmful repeated
  requests. Apply rate limits, quotas, backpressure, bounded fan-out and
  concurrency, and idempotency where the operation needs them.
- Ensure feature flags cannot disable security controls or expose an unguarded
  path. Treat shared libraries and middleware as high-impact changes; inspect
  how consumers order and configure security controls.
- Detect hardcoded credentials, tokens, API keys, connection strings, and
  private keys in reviewed files. Inspect new dependency provenance and known
  vulnerabilities; review changed install, lifecycle,
  build, generator, and plugin scripts before execution. Check private-package
  registry precedence when applicable.
  Check injection in build-time tools that process external input, and apply
  stricter scrutiny to shared input validation and output encoding.
