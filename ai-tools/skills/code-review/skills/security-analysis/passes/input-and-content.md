# Quick: Input, Encoding, and Content

Load for untrusted input, queries, commands, templates, parsers, rendered
content, or schema changes.

- Validate external input with strict types, formats, ranges, allowlists, and
  size limits. Decode or canonicalize before validation. Anchor validation
  regexes; avoid catastrophic backtracking or use bounded regex execution.
  Validate pagination, filtering, and sorting inputs used by APIs.
- Parameterize database queries. Never concatenate untrusted input into SQL,
  shell commands, LDAP or other interpreters. Prefer native APIs; where a
  process is necessary, use argv arrays without a shell.
- Reject unsafe `eval`, dynamic functions, user-controlled imports, and
  prototype-polluting keys such as `__proto__`, `constructor`, and `prototype`.
- Use safe deserialization and strict schemas. Disable unsafe XML features and
  external entities. Allowlist fields assigned to trusted models; never spread
  a raw request body into one.
- Encode for the actual HTML, JavaScript, URL, header, or template context.
  Sanitize untrusted active HTML, SVG, Markdown, and template content before
  rendering; do not assign it directly to `innerHTML`, `outerHTML`, or
  equivalents.
