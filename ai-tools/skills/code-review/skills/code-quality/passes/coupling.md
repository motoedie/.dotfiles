# Coupling and module boundaries

Pass 4/4. Parent passes this file's path; read it from disk.

Review the provided files for structural rot that makes the next refactor
expensive. For every issue found, include a concrete fix (which import
moves, which boundary to add, which layer the call belongs in).

(Skip what the typechecker, `madge`, or `useImportRestrictions` already
flags. Focus on the structural concerns below.)

Pay extra attention to:
- Layering violations: UI components calling DB / API layer directly
  past a service / hook layer; a lower layer importing from a higher one
- Reaching into another module's private internals (importing a name
  conventionally marked private — leading underscore, `internal/`,
  not in the module's index) instead of going through its public API
- Boundary leakage: DB rows passed straight to UI, API response shapes
  used as domain types deep in business logic, ORM entities exposed across
  service boundaries — add a translation step at the seam
- Prop-drilling 4+ levels deep, or context / store sprawl where many
  unrelated things share one bag — split the bag or hoist the shared
  state to where it actually lives
- Implicit ordering: function A must be called before B, but nothing
  enforces or documents it — combine, assert, or comment
- Feature-policy leakage: a feature has a dedicated function/module, but
  part of its behavior is also patched into an unrelated function with a
  different purpose. This couples the unrelated code to feature-specific
  assumptions and makes the next feature variant harder to place. Move the
  behavior into the feature's own helper or the orchestrator that owns the
  flow
- Similar flows where each caller owns different prep, cleanup, or side
  effects — keep an explicit orchestrator at each caller and share named
  lower-level functions. Do not force them through one generic helper if that
  helper needs modes, callbacks, or hidden ordering to work

Be honest about the cost of a fix. Sometimes adding a layer is the right
call, sometimes it's premature plumbing. If the leak is contained and
unlikely to spread, say so.

Explicit orchestration can be the boundary. A job/controller/use-case that
calls shared steps in order is often less coupled than a shared "do everything"
helper that knows every caller's special cases.
