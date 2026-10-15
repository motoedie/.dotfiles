# Identity and Cryptography

- Check outbound TLS certificate and hostname verification beyond literal
  settings covered by the static scanner.
- For MFA, verify a challenge or recovery flow cannot notify the wrong account.
- Check equivalent controls across password, federated, reset, recovery, and
  administrative login pathways. Review password policy and
  compromised-password checks where code controls them.
- Check MFA code entropy, expiry, replay, brute-force protection, factor
  revocation, and administrative account reset. Check federated identity
  namespaces, account linking, and SAML assertion signatures and replay when
  those mechanisms exist.
- Check JWT algorithm/key confusion, JWK/JWKS trust and rotation, and token
  substitution among access, ID, and refresh tokens. Check refresh-token
  rotation and reuse detection.
- Check OAuth response mix-up and replay, authentication-strength and recentness
  claims, and confusion among multiple identity providers when applicable.
