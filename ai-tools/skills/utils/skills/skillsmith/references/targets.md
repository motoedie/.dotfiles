# Target and portability decisions

Read this reference only when selecting a target or using platform-specific
features.

## Portable target

Use `portable` unless the user asks for a particular host. Keep the core workflow
in `SKILL.md` and relative resources. Depend only on the common skill shape:

```text
skill-name/
|-- SKILL.md
|-- references/  optional
|-- scripts/     optional
`-- assets/      optional
```

Keep required `name` and `description` frontmatter portable. Do not add a vendor
field merely because one host understands it. Installation locations are a host
or repository concern, not part of the skill's behavior.

## Platform targets

For `openai`, `cursor`, or `claude`:

1. Verify the host's current documentation or use its native creator/validator;
   supported fields and discovery paths can change.
2. Add an extension only when it produces a concrete routing, interface, safety,
   or token benefit for this skill.
3. Keep the portable workflow complete without the extension where practical.
4. Isolate product metadata in the host's supported location instead of mixing
   it into portable instructions.
5. Report the extension, its benefit, and the portability cost.

A native creator may supply canonical scaffolding or validation. Review its
output against the behavioral contract; do not delegate optimization or accept
generated platform fields without a reason.

## Multiple targets

Prefer one portable core plus small adapters over copied skill variants. Create
separate variants only when host semantics genuinely conflict. If variants are
necessary, identify the canonical source and how drift will be detected.
