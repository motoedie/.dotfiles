export type Segment = { kind: 'markdown'; text: string } | { kind: 'mermaid'; source: string; fence: string }

// Closed fences only: while a reply streams, an unclosed block stays plain code until its closing fence arrives.
const MERMAID_FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*mermaid[ \t]*\n([\s\S]*?)\n {0,3}\1[ \t]*$/gm

export const splitMermaid = (text: string): Segment[] => {
  const segments: Segment[] = []
  let last = 0

  for (const match of text.matchAll(MERMAID_FENCE)) {
    const start = match.index ?? 0
    if (start > last) segments.push({ kind: 'markdown', text: text.slice(last, start) })
    segments.push({ kind: 'mermaid', source: match[2] ?? '', fence: match[0] })
    last = start + match[0].length
  }

  if (last < text.length) segments.push({ kind: 'markdown', text: text.slice(last) })

  return segments
}
