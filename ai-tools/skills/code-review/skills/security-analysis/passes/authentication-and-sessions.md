# Quick: Authentication and Sessions

Load for login, recovery, MFA, sessions, JWTs, OAuth/OIDC, cookies, or shared
authentication controls.

- Enforce authentication on every privileged operation. Check middleware order
  and every authentication path; do not let errors or a route bypass
  authentication or rate limits.
- Prevent account enumeration through messages, status codes, or meaningful
  timing differences. Require appropriate reauthentication for MFA enrollment,
  recovery, replacement, and removal. Scope password-reset tokens, expire them,
  and consume them once. Protect login and recovery from brute force with
  appropriate rate limits or lockout behavior.
- Set appropriate secure cookie attributes. Enforce session expiry, rotation,
  and revocation; regenerate identifiers after login and privilege changes and
  invalidate server-side state on logout.
- Require the expected JWT algorithm; verify the signature,
  relevant expiry, issuer, audience, and purpose claims, and reject attacker
  controlled verification keys or untrusted key sources.
- Validate exact OAuth/OIDC redirect URIs, `state`, PKCE where applicable,
  issuer, audience, signature, expiry, and nonce. Keep authorization codes and
  tokens out of URLs, logs, and user-visible errors.
