# Type modeling

Richard Ejem supplemental check 2/3. Parent passes this file's path only when
Richard Ejem mode is active; read it from disk.

Review whether the types encode the domain strongly enough to prevent
invalid states or ambiguous calls. Give the exact type and ownership boundary
to introduce for issues that require semantic knowledge.

Pay extra attention to:

- Broad records, index signatures, or casts used inside business logic when the
  code relies on a known domain shape. Keep truly dynamic parsed boundaries
  broad only until validation establishes the internal type.
- Enum-shaped values modeled as bare strings or booleans when a literal union,
  enum, or discriminant would prevent invalid combinations and enable
  exhaustive handling.
- Boolean flag parameters that make call sites ambiguous or combine distinct
  operations. Propose split functions or a domain-valued argument.
- Shape-named types such as `StringMap` or `DataObject` when callers need the
  domain meaning to use the value correctly.
- Optional fields that are required only in particular states. Model the valid
  states explicitly instead of requiring every consumer to remember the rule.
- HTTP, queue, file, environment, or other untrusted input entering internal
  code without one clear parse-and-validation boundary.

Do not chase maximal type precision, report issues already established by
static diagnostics, or report type-style preferences. The bar is a realistic
invalid state, typo, or ambiguous call that current modeling permits.
