# Additional Quick Topics

Read only the relevant section for the evidenced browser, infrastructure,
dependency/build, or operational change. The shared Quick passes own input,
authentication, authorization, files, secrets, data flow, and resilience rules.

## Browser resources

- Apply Subresource Integrity to external scripts and stylesheets not covered
  by the scanner's direct static-tag check.
- In a single-page app, ensure CSP covers dynamically injected content and
  third-party scripts.

## Infrastructure and build

- Pin dependency versions and review transitive risk. Verify provenance of
  critical dependencies and harden CI/CD paths against artifact or pipeline
  tampering where committed configuration controls them.
- Restrict egress where possible and use secure container and service-account
  defaults, including least-privilege runtime permissions.

## Detection and response

- Check alerts for suspicious behavior such as credential stuffing and
  anomalous access when alerting configuration is committed.
- Check that changed operational workflows keep incident runbooks and rollback
  procedures current; report repository-unverifiable follow-ups as residual
  risk, not confirmed vulnerabilities.
