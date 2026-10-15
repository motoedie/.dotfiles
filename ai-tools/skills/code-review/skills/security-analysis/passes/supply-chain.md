# Supply Chain

- Review manifest and lockfile changes together. Verify package owner,
  registry/source, resolved artifact, and integrity metadata beyond the
  scanner's structural checks.
- Inspect new or changed install, lifecycle, build, generator, and plugin
  scripts before allowing them to execute.
- Check private package names and registry precedence for dependency-confusion
  risk. Do not allow silent fallback to a public registry.
- Where committed build configuration supports it, verify artifact provenance
  and signing settings. Match integrity metadata to the configured registry.
