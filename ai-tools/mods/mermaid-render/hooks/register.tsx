import type { EngineInterface, Register } from 'claude-code'

import { type Segment, splitMermaid } from './fences'

type Mode = 'svg' | 'ascii'
type Rendered = { ok: true; output: string } | { ok: false; error: string }
type Drawn = Exclude<Segment, { kind: 'mermaid' }> | (Extract<Segment, { kind: 'mermaid' }> & { result: Rendered })

// Room the terminal keeps beside a reply's text (bullet and margins).
const TERMINAL_GUTTER = 4
const RENDERER_FAILED = 'renderer failed'

// Keyed by mode and source: a streaming reply redraws often, and each diagram renders once.
const cache = new Map<string, Promise<Rendered>>()

const renderSegments = async ($: EngineInterface, mode: Mode, segments: Segment[]): Promise<Drawn[]> => {
  const keyOf = (source: string) => `${mode}\0${source}`
  const missing = [
    ...new Set(segments.flatMap(s => (s.kind === 'mermaid' && !cache.has(keyOf(s.source)) ? [s.source] : []))),
  ]

  if (missing.length > 0) {
    const batch = runRenderer($, mode, missing)
    missing.forEach((source, index) => {
      const result = batch.then(results => results[index] ?? failed('renderer returned too few results'))
      cache.set(keyOf(source), result)
      // A renderer that could not run says nothing about the diagram, so the next draw tries again.
      void result.then(r => {
        if (!r.ok && r.error.startsWith(RENDERER_FAILED)) cache.delete(keyOf(source))
      })
    })
  }

  return Promise.all(
    segments.map(async (segment): Promise<Drawn> => {
      if (segment.kind !== 'mermaid') return segment
      const result = (await cache.get(keyOf(segment.source))) ?? failed('diagram was not rendered')
      return { ...segment, result }
    }),
  )
}

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const segments = splitMermaid(e.props.text)

    if (!segments.some(s => s.kind === 'mermaid')) {
      return next(e)
    }

    // The terminal has no vector element, so it gets ASCII art inside the reply's own markdown.
    if (e.surface === 'terminal') {
      const maxWidth = (e.viewport?.columns ?? Number.POSITIVE_INFINITY) - TERMINAL_GUTTER
      const text = (await renderSegments($, 'ascii', segments))
        .map(segment => {
          if (segment.kind === 'markdown') return segment.text
          const { result } = segment
          if (!result.ok) return `${segment.fence}\n\n_mermaid-render: ${result.error}_`
          const width = Math.max(...result.output.split('\n').map(line => line.length))
          if (width > maxWidth) {
            return `${segment.fence}\n\n_mermaid-render: diagram is ${width} columns wide, the terminal has ${maxWidth}_`
          }
          return `\`\`\`text\n${result.output}\n\`\`\``
        })
        .join('')

      return next({ ...e, props: { ...e.props, text } })
    }

    const drawn = await renderSegments($, 'svg', segments)
    const { Box, Markdown, Svg } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {drawn.map(segment => {
          if (segment.kind === 'markdown') {
            return segment.text.trim() === '' ? null : <Markdown text={segment.text} />
          }
          const { result } = segment
          if (!result.ok) {
            return <Markdown text={`${segment.fence}\n\n_mermaid-render: ${result.error}_`} />
          }
          const header = segment.source.trim().split('\n')[0]
          return <Svg source={result.output} alt={`Mermaid diagram: ${header}`} />
        })}
      </Box>
    )
  })
}

const failed = (reason: string): Rendered => ({ ok: false, error: `${RENDERER_FAILED}: ${reason}` })

// One process per batch: the renderer needs Node and beautiful-mermaid, which the hooks module does not have.
const runRenderer = async ($: EngineInterface, mode: Mode, sources: string[]): Promise<Rendered[]> => {
  try {
    const { exitCode, stdout, stderr } = await $.process.run(['node', 'render.mjs'], {
      cwd: `${$.plugin.root}/renderer`,
      stdin: JSON.stringify({ mode, sources }),
    })
    if (exitCode !== 0) {
      return sources.map(() => failed(stderr.trim().split('\n')[0] || `exit code ${exitCode}`))
    }
    return JSON.parse(stdout) as Rendered[]
  } catch (error) {
    return sources.map(() => failed(error instanceof Error ? error.message : String(error)))
  }
}
