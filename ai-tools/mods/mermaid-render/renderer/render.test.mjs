import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

const render = (mode, sources) =>
  JSON.parse(execFileSync('node', ['render.mjs'], { cwd: import.meta.dirname, input: JSON.stringify({ mode, sources }) }))

test('svg follows the light or dark scheme of the surface that draws it', () => {
  const [result] = render('svg', ['graph TD\n  A --> B'])
  assert.equal(result.ok, true)
  const rootTag = result.output.match(/^<svg[^>]*>/)[0]

  assert.match(rootTag, /--bg:var\(--mr-bg\);--fg:var\(--mr-fg\)/, 'background and text take the palette')
  assert.match(result.output, /@media \(prefers-color-scheme: dark\)/)
  const outsidePalette = result.output.replace(/<style>[^<]*prefers-color-scheme[^<]*<\/style>/, '')
  assert.doesNotMatch(outsidePalette, /#[0-9a-f]{3,8}\b/i, 'every color comes from the light or dark palette')
})

test('svg has no web-font import', () => {
  const [result] = render('svg', ['graph TD\n  A --> B'])
  assert.doesNotMatch(result.output, /@import/)
})
