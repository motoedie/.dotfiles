# Large-scope grouping

The goal is full check coverage without giving one reviewer the whole change.

Group the reviewable-file map as is, with file paths as stable IDs and no extra
exclusions. Group by project, feature, or module boundary, keeping callers,
helpers, types, and UI/API mappings for one change together, in the fewest
groups of at most 20 files and 2,000 changed lines. Split only at a real module
boundary, never alphabetically or into arbitrary equal chunks. An indivisible
unit that still exceeds a limit becomes stable function or domain subunits; if
no meaningful split exists, record it as unreviewed.

Record each group's stable ID, file IDs, and selected checks in a coverage
ledger. Groups may run in parallel, one reviewer each, told its group ID and
that it is one of several groups; never run one subagent per check or cap
valid findings. Before synthesis, compare the reviewers'
returns (see `review-rules.md`) with the ledger: a usable result covers its
whole group even if its lists miss entries, duplicate or unexpected results
change nothing, and a group without a usable result is unreviewed.

Give the synthesis subagent the group summaries and findings, the
reviewable-file map, and the ledger. If synthesis fails, the combined group
findings go to verification instead.
