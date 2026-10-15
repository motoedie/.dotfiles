# Large-scope grouping

The goal is full coverage of every selected rule without giving one reviewer
the whole change.

Use the reviewable-file map as is, with file paths as stable IDs and no extra
exclusions, and record its exclusions and reasons. Map changed hunks and
relevant tests, attach changed lockfile entries to their manifest or build group
as supply-chain context, and keep unchanged callers, schemas, configuration, and
dependencies as evidence context. Group target files by feature, project,
module, and trust boundary, keeping related routes, handlers, services, storage,
authorization, types, and tests together, in the fewest units of at most 20
files and 2,000 reviewable lines. Split only at a real module or domain
boundary, never alphabetically or into equal-sized slices. Shared context may
appear in several units, but each target file belongs to one group. A tightly
coupled file that exceeds a usable unit or gets truncated becomes stable
semantic subunits for its functions or domain sections, each recording its exact
target lines or hunks and repeating shared dependency context; if no meaningful
split exists, record the range as not reviewed and set `complete` to `false`.

Record each unit's ID, file IDs, and expected file/pass checks, including
conditional Quick high-assurance passes, in a coverage ledger; Deep also
expects one whole-change result each for threat modeling, exploit validation,
and operational readiness. Units may run in parallel, one reviewer each, told
its unit ID and that it is one of several units. Compare the returned records
with the ledger and resolve cross-unit links before calling coverage complete:
a usable result covers its whole unit even if its lists miss entries, and
duplicate or unexpected results change nothing; only the evidence or checks a
unit reports it could not inspect stay unreviewed. A failed, unreadable,
missing, or truncated unit keeps its successful findings, sets `complete` to
`false`, and has its exact groups, files, ranges, passes, and links named;
never silently sample or imply the whole scope was reviewed.

Give the synthesis subagent the unit records and findings, the reviewable-file
map, the ledger, and the full paths of the threat-modeling,
exploit-validation, and operational-readiness passes. If synthesis fails, its
candidate set is the combined unit findings and security test gaps.

Also give the verifier the unresolved links and cited evidence; it checks
cross-unit links per `verify-findings.md`, inspecting the evidence needed to
decide each dispute. A finding rejected under `verify-findings.md` is not a
coverage gap.
