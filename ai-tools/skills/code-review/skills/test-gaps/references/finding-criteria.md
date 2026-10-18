# Finding Criteria

The parent, reviewer, and verifier follow these rules. Report only: do not write
tests, edit files, modify the Git index, approve the change, or
decide CI failure policy. Do not report general defects or coverage-percentage
targets. Be explicit about uncertainty and any scope that was not reviewed.

## Impact

Impact rates what the named mutant would do in production if it shipped
undetected; it does not claim that the change contains a defect. Rate the
mutant's effect on what a user, caller, or operator observes:

- `critical`: broad data loss or service failure. Examples: a migration's
  `WHERE` clause is dropped and deletes every row; a startup config parser
  throws on a valid value and the service crash-loops.
- `high`: an important flow or contract breaks, or a severe resource failure
  occurs. Examples: an API returns a renamed field and every caller reads
  `undefined`; a save handler sends a stale form value and silently overwrites
  the user's edit; an operator's saved configuration is lost; a retry loop
  never stops and exhausts the connection pool.
- `medium`: an existing flow loses behavior or shows wrong or empty data for a
  reachable input, or causes real operational cost. Examples: a filter returns
  wrong rows for one operator; a deep link loses one query parameter; an error
  toast never appears for a failed request; a query runs once per row.
- `low`: a mistake a user or operator could notice, but no behavior, data,
  contract, or resource use changes. Examples: a dialog title names the wrong
  entity; a log line names the wrong resource; a disabled button keeps its
  tooltip.

Judge consequence, frequency, and recovery cost together. A failure that few
users hit can still be `high` when it loses their data or is hard to recover
from. A mutant that changes behavior for a reachable input is at least
`medium`. When unsure between two levels, pick the lower one; the verifier sets
the final impact.

Report gaps at or above the resolved impact threshold; never report `low`
gaps. Drop a gap whose risk exists only if part of the reviewed change ships
without the rest.

One gap covers one behavior: fold every mutant of that behavior into a single
gap with a single suggested test.
