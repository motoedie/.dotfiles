# Standard: Specialized Injection and Parsing

Load only for the corresponding interpreter, output, or parser surface.

- Check LDAP, XPath, JNDI, SMTP/IMAP, LaTeX, CSV/formula, and format-string
  injection where those formats or interpreters are reachable.
- Check parser inconsistencies between URL, JSON, XML, and filesystem parsers,
  including differences in decoding and canonicalization.
- Check context-specific sanitization of SVG, Markdown, CSS, and expression
  languages beyond the Quick rendering checks.
