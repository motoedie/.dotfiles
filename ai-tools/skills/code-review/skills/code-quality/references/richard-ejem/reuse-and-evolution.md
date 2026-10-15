# Reuse and evolution

Richard Ejem supplemental check 3/3. Parent passes this file's path only when
Richard Ejem mode is active; read it from disk.

Review whether a seam surprises another caller or forces the next
variant through scattered mechanical edits. Propose the smallest explicit seam
that fixes the demonstrated cost.

Pay extra attention to:

- Helpers that unexpectedly mutate caller-owned inputs. Return new data or make
  the mutation explicit in the API and name when mutation is intentional.
- Reusable code coupled to module-level clients, configuration, singletons, or
  mutable state when an existing or imminent second caller needs independent
  ownership or substitution.
- Import-time or constructor side effects such as I/O, network calls, or global
  registration that prevent callers from controlling lifecycle.
- The same discriminator handled in three or more places, or a new variant
  requiring several production files to change in lockstep. Identify the
  repeated edits and propose one dispatch or ownership seam.
- Feature-specific policy patched into a reusable helper or unrelated workflow,
  making future callers inherit hidden behavior.
- Generic runners with caller-specific flags, callback bags, step arrays, or
  hidden ordering. Prefer shared named operations with explicit orchestrators
  when workflows genuinely differ.
- Hardcoded behavior at an established extension seam when the current change
  already demonstrates multiple open-ended variants.

Do not demand dependency injection, immutability, or extensibility for its own
sake. A single-use feature helper and a closed, small exhaustive switch are
often clearer. Reject fixes that replace visible duplication with branches and
mode flags.
