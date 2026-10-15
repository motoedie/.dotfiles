# Clarity and contracts

Richard Ejem supplemental check 1/3. Parent passes this file's path only when
Richard Ejem mode is active; read it from disk.

Review the provided files for semantic inconsistency or missing intent that
would make a maintainer reverse-engineer the code. Give the exact rename,
constant, assertion, comment, or contract change needed.

Pay extra attention to:

- One domain concept named differently across siblings, inconsistent
  file naming or paradigms among peers, or inconsistent error/result shapes for
  the same operation. Prefer the established nearby vocabulary and pattern
  when the inconsistency obscures ownership or behavior.
- Vague names, misleading magic values, or dense expressions that hide
  business meaning, a side effect, or a load-bearing decision.
- The same rule, limit, allowed-value set, regex, external identifier, or URL
  fragment hardcoded in two or more places instead of one existing owner.
- Hand-rolled behavior when the project or language already provides the same
  operation; verify the reusable implementation exists before reporting it.
- Implicit invariants such as sorted, non-empty, unique, or ordered input when
  violating the assumption would produce incorrect behavior. Propose an
  assertion or a concise explanation at the boundary that establishes it.
- Public surfaces whose non-obvious inputs, outputs, errors, or edge cases are
  impossible to infer from their types and implementation.
- Workarounds, compatibility decisions, performance trade-offs, retry timing,
  or ordering constraints whose rationale is missing and likely to be undone.
- Stale comments or examples that now contradict behavior.
- Commented-out implementations and TODO/FIXME notes describing work already
  completed.
- A non-trivial module whose ownership boundary cannot be understood from its
  name, exports, and neighboring conventions; propose the specific ownership
  note needed.

Report alternative wording or casing only as a `nit` citing the line it concerns;
the standard passes' bans on such findings do not apply to this check.
Do not report comment density, missing docstrings on routine code, or requests
to narrate what the code already says.
