# Additional Security Topics

Use these topics when baseline checks are not enough or when the system has elevated risk.

## 1. Threat Modeling and Abuse Cases

- Identify assets, trust boundaries, and attacker goals.
- Enumerate abuse cases for each entry point.
- Rank risks by likelihood and impact.

## 2. Web and API Protections

- Verify CSRF defenses for state-changing browser flows.
- Keep CORS rules minimal and origin-specific.
- Apply security headers (CSP, X-Content-Type-Options, Referrer-Policy, frame protections).
- Validate pagination, filtering, and sorting inputs for API abuse.

## 3. Authentication and Session Hardening

- Validate token lifetime, rotation, and revocation strategy.
- Ensure password reset and account recovery are abuse-resistant.
- Protect login and recovery endpoints with rate limiting and lockout strategy.

## 4. Authorization Depth and Tenant Isolation

- Enforce object-level authorization (not only route-level checks).
- Validate cross-tenant access boundaries on every data query.
- Prevent insecure direct object references (IDOR).

## 5. File Upload and Content Processing

- Validate media type using signature, not filename extension alone.
- Scan or quarantine risky files before downstream processing.
- Isolate parsers/converters that process untrusted content.

## 6. Secrets and Key Management

- Keep secrets in managed secret stores and rotate them periodically.
- Avoid long-lived static credentials.
- Separate encryption keys by environment and purpose.

## 7. Dependency and Supply Chain Security

- Pin dependency versions and review transitive risk.
- Verify package provenance for critical dependencies.
- Harden CI/CD to prevent artifact and pipeline tampering.

## 8. Runtime and Infrastructure Hardening

- Apply least-privilege runtime permissions.
- Restrict egress where possible to reduce lateral movement.
- Enforce secure defaults for containers and service accounts.

## 9. Logging, Detection, and Incident Readiness

- Emit high-signal audit events for auth and permission changes.
- Alert on suspicious patterns (credential stuffing, anomalous access).
- Keep incident runbooks and rollback procedures current.

## 10. Data Protection and Privacy

- Classify data by sensitivity and apply matching controls.
- Minimize retained personal or regulated data.
- Define deletion and retention behavior explicitly.

## 11. Resilience Against Abuse

- Add rate limiting, quotas, and backpressure for expensive operations.
- Use idempotency keys for retried operations.
- Bound fan-out and concurrency for user-triggered workflows.
