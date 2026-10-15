# Quick: Cryptography and Secrets

Load for passwords, tokens, credentials, randomness, encryption, signing, key
storage, or secret comparison.

- Reject custom authentication or cryptography and weak algorithms or cipher
  modes. Use established project libraries and cryptographically secure
  randomness for secrets, tokens, nonces, and keys.
- Hash passwords with a password-hashing function rather than a general
  purpose hash.
- Use authenticated encryption where ciphertext integrity matters and prevent
  nonce or IV reuse. Use established verification APIs and constant-time
  comparison for secret values when timing is observable; ordinary public
  identifier equality does not require it.
- Separate keys from encrypted values and by environment and purpose. Keep
  stored secrets in an established managed secret store, avoid long-lived
  static credentials, and check code-controlled rotation.
