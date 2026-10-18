# Test Gaps

Review the selected change, including additions, fixes, and refactors, for
test gaps that matter. A gap exists only when a realistic **mutant** of the
changed code is expected to ship with every current test green.

A mutant is one plausible wrong edit a developer could make to the changed
code: a flipped condition, a dropped branch, a wrong field, a missing encoding,
an unhandled error. Name it concretely ("the snapshot id is no longer
URL-encoded in the request path"), not abstractly ("the function breaks").

## Gate

Propose a gap only when every check holds:

1. **Mutant** — name one realistic mutant of the selected change.
2. **Survives** — search existing coverage first: co-located tests, Storybook
   stories and `play` functions, integration and E2E tests, and tests of shared
   helpers the change calls. Coverage anywhere counts. Cite the closest tests
   and explain, from their inputs and assertions, why each is expected to stay
   green under that mutant.
3. **Kills** — explain why the suggested test is expected to go red on that
   mutant.
4. **Refactor-safe** — the suggested test stays green when the code is
   restructured without changing what consumers observe.
5. **Observable** — the suggested test asserts what a consumer sees: data or
   state a user reads or acts on, navigation, a request URL or body, a toast or
   emitted event, a stored value, a returned value, or a status code.
6. **Reachable** — for an edge case, cite the real source of that input, such as
   an API that returns `[]`, a nullable column, or free user input. A type
   declaration settles nothing either way: it does not validate API responses,
   stored data, or user input at runtime. Treat an input as unreachable only
   when you cite an enforced upstream guarantee, such as runtime schema
   validation, a database constraint, or a filter on every path to the code.

No surviving mutant, no gap.

Survives and Kills are predictions from inspected code. State them as expected
outcomes; call an outcome observed only when you ran the tests.

## Where gaps matter

Look first where a surviving mutant hurts most:

- **Business logic** — product rules, workflows, state transitions, and calculations
- **Consumer contracts** — HTTP request and response shapes, status codes, URL
  and query parameters, persisted or shared state, and emitted events or messages
- **Data integrity** — writes, migrations, transactions, and concurrent updates
- **Integration points** — databases, external services, queues, and file systems
- **Error and recovery paths** — failures, retries, and partial-failure handling
- **Boundaries** — off-by-one, empty, and limit values that real input reaches

A refactor is eligible when it changes logic (conditions, control flow, or data
shape) and the affected behavior lacks a test; the change need not intend a
behavior change. Moves, renames, and reformatting carry no mutant worth a test.

## Test level

- **Unit** — isolated logic, branching, and edge cases
- **Integration** — contracts between modules and service or repository interactions
- **API** — HTTP or RPC request, response, and status contracts
- **E2E** — critical user flows only
- **Frontend** — rendered UI behavior in a Storybook story `play` function; data
  transforms and non-rendering hooks in a Vitest unit test. When the component
  already has a co-located `*.test.tsx`, extend that file instead.

Keep the behavior under review real: the unit itself and the children and
collaborators that carry that behavior. Mock system boundaries (network, time,
storage, and randomness) and collaborators unrelated to the behavior. A test
that mocks away the behavior asserts the mock.

## Out of bounds

Cosmetic and structural assertions catch no mutant a consumer would notice,
or another tool already guards them. They never form a gap or a suggested test:

- CSS or utility classes, element nesting, and layout; visual review covers
  them;
- DOM tag names asserted for their own sake;
- fixed copy, labels, and tooltip wording;
- configuration object shapes, such as column format types or dependency lists;
  assert the behavior they produce instead;
- props passed to a mocked child component;
- whether a type, constant, or module export exists, or anything else the type
  checker already guarantees;
- render-only smoke tests, `toBeDefined()` as the only assertion, and call
  assertions that leave the contract-carrying arguments unchecked; and
- trivial getters or setters.

Purpose decides, not assertion syntax. An assertion of the same form is in
bounds when it protects a named interaction or contract and passes the gate:

- a no-argument callback call, when the call itself is the completion
  contract, such as `onSaved()` after a successful save;
- text that carries data a user decides on, such as a delete warning that
  names the resource; and
- an element's role or keyboard behavior, asserted by role or by interaction,
  when it decides how users operate the element.

Also skip gaps in code being deleted or replaced, and security-specific gaps.

## Impact and grouping

Apply the impact and grouping rules in
[finding-criteria.md](../references/finding-criteria.md).

## Weak tests

Check every added or changed test in the selected scope against the gate.

A test that protects part of a behavior but misses a scenario is a **partial
test**. Keep it. Report the missing scenario as a gap, cite the partial test in
the gap's evidence, and suggest another scenario or a stronger assertion.

A **weak test** gives false confidence: its name or the change implies that it
protects a behavior at or above the impact threshold, yet it asserts only
out-of-bounds properties, asserts a mock standing in for that behavior, or uses
a mock that materially differs from what it replaces. When a weak test sits on
the same behavior as a gap, fold it into that gap's evidence. Report the rest
as weak tests: recommend rewriting each to assert that behavior, or deleting it
when it protects nothing meaningful.
