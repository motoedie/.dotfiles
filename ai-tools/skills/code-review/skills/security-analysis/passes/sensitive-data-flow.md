# Sensitive Data Flow

## Report As

Report a finding only when scoped sensitive data can be exposed, persisted,
logged, over-retained, sent to the wrong audience, or handled without the
required boundary control. Name the data, where it flows, and the missing
control.

- Identify sensitive data handled by reviewed code: tokens, credentials, cookies,
  auth headers, PII, tenant data, customer data, exports, snapshots, audit data,
  or regulated data.
- Trace sensitive data across input, validation, storage, logs, telemetry,
  queues, caches, exports, downloads, client state, and outbound calls.
- Verify sensitive data is minimized, redacted, scoped to the right audience,
  and not retained longer than necessary. Check deletion and retention behavior
  when the reviewed code controls it. Minimize persistent sensitive browser
  state and clear it on logout or account changes; necessary authorized data
  in memory is not itself a vulnerability.
- Check that user-visible errors and logs expose enough context for debugging
  without revealing sensitive internals.

## Quick token and credential persistence

Whenever reviewed code creates, receives, transforms, or stores a password,
token, credential, API key, refresh or reset token, private key, or passphrase:

1. Trace the value through storage, logs, telemetry, queues, caches, and
   responses. Inspect the repository code and committed configuration that
   implement storage protection.
2. Require a password-hashing function for passwords, a one-way hash when
   only token verification needs the original value, and encryption when a
   token must be retrieved. Accept an established managed secret store when
   repository evidence establishes its use.
3. Reject plaintext persistence, Base64, custom reversible obfuscation, and
   logging. Check that encryption keys are neither hardcoded nor stored beside
   the ciphertext.
4. Report confirmed plaintext persistence as a vulnerability using the normal
   severity and evidence rules. If protection is external and cannot be proven
   from repository evidence, record the missing evidence for verification; do
   not report the candidate if verification rejects the claim.
