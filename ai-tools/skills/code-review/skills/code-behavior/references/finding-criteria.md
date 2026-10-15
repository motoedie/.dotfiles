# Finding Criteria

A candidate qualifies only when the cited line plus a caller,
contract, or concrete failure path demonstrate a defect; reachability may stay
unconfirmed as described below. Existing code counts as newly reachable when
the change sends new inputs, types, or callers into it. Judge the code as it
stands after the whole reviewed change: a problem that exists only if part of
the change ships without the rest is not a defect, but one with stored data,
external callers, or instances still running the previous release is. Include
impact, category, affected files, explanation, and a specific suggested action.

Impact is the concrete consequence if the defect is not fixed. Judge it by
what a user, caller, or operator observes:

- `critical`: broad data loss or service failure. Examples: a migration
  deletes rows; a crash loop takes a service down.
- `high`: an important flow or contract breaks, or a severe resource failure
  occurs. Examples: an API returns the wrong field to all callers; a job leaks
  connections until the pool is exhausted.
- `medium`: an existing, working flow loses behavior or shows wrong or empty
  data for a reachable input, or causes real operational cost. Examples: a tab
  or action disappears; a panel shows an empty state for valid data; a filter
  returns wrong rows; a query runs once per row instead of once per request.
- `low`: no change in behavior, data, contracts, or resource use, but a user
  or operator sees wrong or misleading information. Examples: a label, title,
  or message states a wrong fact; a log message names the wrong resource.
- `nit`: nothing is wrong or misleading; only taste, typos, or style.
  Examples: a typo in debug-only text; a wording preference; log format style.

Report every critical-, high-, medium-, and low-impact candidate. Do not cap
findings. A candidate that changes behavior for a reachable input is at least
`medium`. When you cannot confirm it is reachable, report it with your best
impact and name the data to check. The verifier sets the final impact.

Reviewers drop `nit` candidates at once and do not send them to the verifier;
when unsure between `nit` and `low`, propose `low`. Never drop a candidate for
any other impact.

Do not propose:

- issues linters or type checkers will catch;
- structural maintainability concerns owned by code-quality review;
- test coverage gaps owned by test-gaps review;
- security concerns owned by security review; or
- issues silenced through ignore comments in the code.
