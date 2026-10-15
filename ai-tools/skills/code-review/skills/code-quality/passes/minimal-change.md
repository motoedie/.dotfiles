# Minimal change

Pass 1/4. Parent passes this file's path; read it from disk.

Review the provided files for code that can be removed or simplified without
changing required behavior. For every issue, cite the caller, search, test,
invariant, or requirement that proves the smaller version is safe, then name
the exact code to delete, inline, or replace.

Fix in this order: delete, inline, reuse existing code, then add an abstraction
only when current behavior requires one. If a fix adds production code, state
the correctness, security, external-boundary, or public-API constraint that
makes it unavoidable. Shorter is not better when it hides behavior.

Pay extra attention to:

**Instruction drift:**

- When instructions are provided, every new production concept, option,
  fallback, abstraction, or side effect must map to those instructions, an existing
  caller, or a stated correctness, security, external-boundary, or public-API
  constraint. Flag the smallest removable unit when it maps to none of them.
- Do not infer scope creep when instructions are unavailable; rely on concrete
  callers and constraints instead.

**Dead and speculative code:**

- Superseded implementations, unreachable/impossible branches, unused
  options/types/exports, and compatibility code for behavior introduced by the
  same change. Search consumers before calling public code dead.
- Placeholder fallbacks, callbacks, modes, extension hooks, registries, or
  dependencies with no current caller or requirement.
- Repeated validation after a boundary already validated the value.
- Debug code and comments that preserve implementation or agent history.

**Needless indirection:**

- Pass-through or `async` wrappers, multi-hop forwarding, empty stubs, no-op
  hooks, identity transforms, and callback relays.
- One-use helpers that hide simple code; single-implementation factories,
  builders, strategies, adapters, or registries.
- Retry/timeout/queue wrappers without that requirement, and one-consumer
  barrels or re-exports outside project convention.

**Type and validation ceremony:**

- One-use aliases, empty interfaces, concrete-case generics/overloads, and
  parallel types with identical shapes but no real boundary.
- Internal validation of already typed/narrowed values; downstream assertions
  or fallbacks compensating for an overly broad type owned by the change.
- Result/error wrappers no caller branches on, and DTO/domain/view mappings
  that copy fields one-for-one without crossing a real boundary.

**Non-native TypeScript/JavaScript ceremony:**

- Data-only, utility, single-instance, or single-implementation class
  hierarchies that can be plain data, functions, or modules.
- Manual collection state machines where a standard operation is clearer;
  promise wrapping, expected-flow exceptions, and getters/setters with no
  invariant.
- Defensive cloning and multiple mapping/iteration layers with no distinct
  boundary, mutation risk, or readability benefit.

**Agent-edit residue:**

- Abandoned and replacement approaches left together; temporary
  `old`/`new`/`legacy`/`v2` names, adapters, aliases, or re-exports.
- Repeated conversions, defensive branches, validation, or error mapping added
  by separate iterations at different layers.
- Config, flags, registries, or abstractions with one live mode or combination.
- Catch/rethrow noise, impossible fallbacks, debug code, and mechanical helper
  splits that still expose one linear flow.

**Unnecessary React machinery:**

- `useMemo`, `useCallback`, or `memo` without expensive work or a consumer that
  needs stable identity.
- One-use hooks, wrapper components, context/providers, reducers, stores, or
  generic component APIs that add no behavior or shared ownership.
- State derived entirely from props/state; effect chains replaceable by direct
  calculation or event-handler work; ref layers with no ref consumer.

Don't flag:

- External-boundary validation, security checks, public compatibility, or
  framework/project conventions.
- Wrappers enforcing policy, transactions, instrumentation, or ownership.
- Named orchestration steps or clear loops. Leave duplicate code to the
  duplication pass.
- Types/classes with real invariants, boundaries, or multiple implementations.
- React memoization with measured cost or required identity; effects syncing
  external systems; state preserving user edits.
- Pure naming, formatting, or organization preferences. SRP still owns names
  that hide mixed responsibilities.

Group related artifacts as one finding. If live code still needs a split, shared
helper, or boundary move after simplification, tag the relevant structural lens.
