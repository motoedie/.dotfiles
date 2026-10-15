# Operational Readiness

## Report As

Report operational-readiness issues as follow-up findings unless the reviewed
code has an immediate exploitable weakness. Name the missing operational
control, the affected security event or failure mode, and the minimal follow-up
action.

- Check whether security-relevant actions emit audit events with actor, target,
  result, and reason where applicable.
- Check whether suspicious behavior can be detected or alerted on, such as
  credential stuffing, permission probing, repeated blocked exports, or
  anomalous access.
- Verify rollback or disablement path for risky changes, especially auth,
  permission, export, deletion, and key-handling behavior.
- Identify key rotation, incident-response, and residual-risk follow-ups when
  the scoped change affects credentials, secrets, encryption, or privileged
  access.
- When cryptographic keys change, check their owner, purpose, storage,
  environment separation, rotation, revocation, expiry, recovery path, and
  migration from retired algorithms.
- When build or release artifacts change, verify traceable build provenance and
  signatures where supported. Check that the shipped SBOM matches the reviewed
  lockfile and build.
