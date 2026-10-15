# Single responsibility

Pass 2/4. Parent passes this file's path; read it from disk.

Review the provided files for functions, classes, or modules that own behavior
with different reasons to change. Count is not the test: two related-looking
steps still violate SRP when they evolve independently.

A function may coordinate many steps and still have one responsibility. The
violation is mixing separate domain problems that change independently.

For every issue, name both change-axes and give a concrete fix: what stays, what
moves, and the target function/file. Ask:

- Would these concerns normally change in different PRs?
- Can a reader understand one without understanding the other?

Common split axes: I/O vs parsing, validation vs writes, transport mapping vs
domain mapping, and persistence vs business policy.

Pay extra attention to:

**Names that lie about responsibility:**

- Query names (`get`, `fetch`) that mutate, persist, or perform a command;
  `validate` that writes; `parse` that performs I/O; `format`/`render` that
  mutates input.
- Boolean names whose truth value means the opposite; `cleanup`/`reset`/`init`
  hiding throws or ordering requirements.
- `types.ts`, `constants.ts`, or `utils.ts` containing domain policy; generic
  helpers owning feature decisions.
- Noun-like classes acting as services/orchestrators, or vague verbs
  (`process`, `handle`, `manage`) hiding a specific operation.

A name that lies about what code does is usually an SRP violation manifesting
as wrong labeling: the function/module owns more than what its name advertises,
or owns the wrong thing entirely. The fix is usually a split or a move, not a
pure rename.

Bar: would a reader who trusts the name be wrong about what this code does? If
yes, report it. A pure rename is enough only when the structure is already
correct. Do not flag casing, abbreviations, alternative wording, length,
accurate generic names, or cross-file consistency unless it hides duplication.

**Function level:**
- Three or more unrelated operations, or high-level orchestration tangled with
  low-level parsing/string manipulation.
- Deeply nested logic that obscures the function's decisions.
- Feature policy patched into a different-purpose function instead of the
  feature's own step or orchestrator.

**File / module level:**
- Three or more concerns—validation, mapping, API calls, rendering, state,
  types/config—or a file that cannot be summarized in one sentence.
- UI files containing substantial schemas, resolvers, error mapping, API/form
  transformations, or non-React helpers.
- Multiple substantial components, or a modal/drawer/side panel/wizard/settings
  surface with its own props, actions, conditions, or testable behavior. Keep
  state/data orchestration in the parent and presentation in the extracted
  surface.
- Shared constants/config spanning concerns, or feature behavior split between
  its owner and a workaround in an unrelated module.

**Anti-pattern: don't fragment cohesive flow:**
- Preserve orchestration that visibly coordinates domain steps, cleanup, error
  handling, and side effects.
- Do not extract merely to reduce line count, satisfy lint, or spread code
  thinner; local helper components are not real splits when both concerns still
  must be understood together.
- Leave behavior together when it has the same change-axis, audience, and
  lifecycle.
- Prefer explicit named calls in workflow order over generic runners, callbacks,
  modes, or step arrays unless callers need runtime composition.

Explicit orchestration is often the cohesive home for domain flow; generic
runners can smear feature policy across the wrong abstraction.

Every extracted unit must have one clear purpose. Name the target, what moves,
what stays, and affected consumers/tests. Keep the original focused on its
primary export or orchestration role.
