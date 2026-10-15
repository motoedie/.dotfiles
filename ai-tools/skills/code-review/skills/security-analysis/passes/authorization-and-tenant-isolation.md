# Authorization and Tenant Isolation

## Report As

Apply the output format's eligibility rules. For each
concrete boundary risk, name the protected object, the missing or
insufficient check, and the unauthorized actor or tenant that could reach it.

- Check object, function, and property-level authorization, not only route-level
  checks. Enforce it server-side for every privileged operation.
- Verify tenant/account/workspace/org identifiers are constrained in every data
  access path.
- Look for IDOR risk when user-controlled IDs select objects, jobs, exports,
  files, or records.
- Check background jobs, queue consumers, scheduled tasks, and event handlers
  for explicit user/tenant context instead of ambient elevated privileges.
- Verify shared middleware or library changes cannot be consumed in an order
  that bypasses auth or rate-limit controls.
