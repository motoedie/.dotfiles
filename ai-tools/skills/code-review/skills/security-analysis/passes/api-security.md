# API Security

- Enforce property-level authorization on request and response fields. Do not
  expose hidden, privileged, tenant-internal, or write-only fields because the
  caller may access the containing object.
- Check the API inventory when routes or versions change. Find deprecated,
  shadow, debug, or alternate-version endpoints that retain weaker controls.
- Verify detailed transport and source authentication, schema and size limits,
  timeout and redirect behavior, and downstream use for external services.
- Enforce intended HTTP methods and content types on alternate API entry
  points. Check GraphQL depth, complexity, and batching limits where GraphQL is
  exposed.
- Verify webhook authenticity and replay protection. Compare external-service
  trust and redirect behavior with the same service's other callers.
