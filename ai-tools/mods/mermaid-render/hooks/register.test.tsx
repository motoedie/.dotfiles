import { expect, test } from 'claude-code/testing'

const FLOW = 'graph TD\n  A --> B'
const REPLY = `Before.\n\n\`\`\`mermaid\n${FLOW}\n\`\`\`\n\nAfter.`
const message = (text: string) => ({ component: 'AssistantMessage' as const, props: { text, isFirstOfReply: true } })
// What the renderer process answers, standing in for Node, which tests do not have.
const ran = (results: unknown) => ({
  value: { exitCode: 0, stdout: JSON.stringify(results), stderr: '', isStdoutTruncated: false, isStderrTruncated: false },
})

test('desktop draws a mermaid block as an Svg between the markdown around it', async ($, on) => {
  on('process.run', () => ran([{ ok: true, output: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' }]))

  const ui = await $.ui.mount({ plugin: 'mermaid-render', surface: 'desktop', ...message(REPLY) })

  const svg = await ui.find({ type: 'Svg' })
  expect(svg).toBeDefined()
  expect(await ui.findAll({ type: 'Markdown' })).toHaveLength(2)
})

test('desktop shows the source and the error when a diagram does not parse', async ($, on) => {
  on('process.run', () => ran([{ ok: false, error: 'Invalid mermaid header' }]))

  const ui = await $.ui.mount({ plugin: 'mermaid-render', surface: 'desktop', ...message(REPLY) })

  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  expect(await ui.find({ type: 'Markdown', text: /Invalid mermaid header/ })).toBeDefined()
})

test('terminal swaps the mermaid block for its ASCII art in the reply text', async ($, on) => {
  let drawnText = ''
  on('process.run', () => ran([{ ok: true, output: '[A] --> [B]' }]))
  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    drawnText = e.props.text
    const { Text } = $.ui.resolve(e)
    return <Text>{e.props.text}</Text>
  })

  await $.ui.mount({ plugin: 'mermaid-render', surface: 'terminal', ...message(REPLY), viewport: { columns: 120, rows: 40 } })

  expect(drawnText).toBe('Before.\n\n```text\n[A] --> [B]\n```\n\nAfter.')
})

test('a reply still streaming its mermaid block is left alone', async ($, on) => {
  let runs = 0
  let drawnText = ''
  on('process.run', () => {
    runs += 1
    return ran([])
  })
  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    drawnText = e.props.text
    const { Text } = $.ui.resolve(e)
    return <Text>{e.props.text}</Text>
  })

  const streaming = `Before.\n\n\`\`\`mermaid\n${FLOW}\n`
  await $.ui.mount({ plugin: 'mermaid-render', surface: 'desktop', ...message(streaming) })

  expect(runs).toBe(0)
  expect(drawnText).toBe(streaming)
})
