# Test Gaps

Review the selected change, including additions, fixes, and refactors, for
behavior-focused test coverage gaps. For every gap, cite the affected behavior,
the selected code change, and the closest relevant existing tests showing that
coverage is absent.

Focus on tests that matter, not coverage for its own sake. Prioritize:

- **Business logic** — product rules, workflows, state transitions, and calculations
- **Public API contracts** — endpoints, exported functions, and message schemas
- **Data integrity** — writes, migrations, transactions, and concurrent updates
- **Integration points** — databases, external services, queues, and file systems
- **Error and recovery paths** — failures, retries, and partial-failure handling
- **Wrong-result edge cases** — boundaries, null values, and empty inputs

Match the test level to the behavior:

- **Unit** — isolated logic, branching, and edge cases
- **Integration** — contracts between modules and service or repository interactions
- **API** — HTTP or RPC request, response, and status contracts
- **E2E** — critical user flows only
- **Frontend** — rendered UI behavior in a Storybook story `play` function;
  data transforms and non-rendering hooks in a Vitest unit test

Propose each gap with a provisional impact from `output-format.md`; do not drop
it for its impact. A refactor can produce a gap when relevant behavior lacks
protection; do not require the change to intentionally alter behavior.

Skip:

- trivial getters or setters;
- gaps in code being deleted or replaced; and
- security-specific test gaps.

Also identify changed tests whose assertions do not prove their stated
behavior, mocks that materially differ from what they replace, and tests that
would still pass when the changed behavior regresses.
