/**
 *
 * BUG: only for pretty printed (non linear / single line) json
 * BUG: can yield random lines (searches by key path matches, ignores if nested/depth)
 */
export function jsonKeyPosition(json: string, path: string[]) {
  let lines = json.split('\n')
  let acu = 0
  for (let key of path) {
    let idx = lines.findIndex(x => RegExp(`^\\s*\\"${key}`).test(x))
    acu += idx

    lines = lines.slice(idx)
  }
  return { line: acu + 1 }
}
