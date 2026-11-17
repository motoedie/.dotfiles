# Test flows

Write UI test steps for every part of the UI that the frontend and backend
changes affect. Find those parts by following the changed code through its
callers to the screens that use them. Every step, Setup included, is something
the tester does or sees in the UI. When one of those parts needs data the UI
cannot create, list only its screen name under **Not testable in the UI**.

Start with a **Setup** line: feature flags that gate those parts, which user to
use and why (an admin passes every permission check), and data to create. Then
write at most six numbered flows. Give each step the exact UI path, fictitious
names, and what the tester should see. End each flow on what the tester sees.
Mark any menu, page, or button label the code cannot confirm as
`(unconfirmed)`. End with a flag-off check for each of those flags, then
restore the flag.
