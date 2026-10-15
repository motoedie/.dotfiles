# Quick: APIs and Browser

Load for API routes, webhooks, WebSockets, browser rendering, client state,
cross-origin messaging, or browser credential use.

- Authenticate WebSocket connections; authorize every action, object, channel,
  and audience. Validate payloads and browser origins, honor session revocation,
  rate-limit events, and prevent cross-tenant broadcasts.
- Apply CSRF protection to state-changing browser requests with automatically
  included credentials. Restrict CORS and configure appropriate CSP, content
  type, referrer, and frame protections.
- Validate `postMessage` origin and payload. Prevent `window.opener` access from
  untrusted destinations.
- Authenticate webhooks and validate their payloads before sensitive use.
