import { diffChars, diffLines } from 'diff'

export const diff = (kv: { before; after }) => {
  let acu = []

  let before =
    typeof kv.before === 'string'
      ? kv.before
      : JSON.stringify(kv.before, null, 2)

  let after =
    typeof kv.after === 'string' ? kv.after : JSON.stringify(kv.before, null, 2)

  // let changes = diffLines(before, after)
  let changes = diffChars(before, after)

  for (const part of changes) {
    if (!part.removed && !part.added) continue

    const color = part.added
      ? '\x1b[32m' // Green for added
      : part.removed
      ? '\x1b[31m' // Red for removed
      : '\x1b[0m' // Reset color for unchanged

    acu.push(color + part.value + '\x1b[0m')
  }
  return acu.join('\n')
}
