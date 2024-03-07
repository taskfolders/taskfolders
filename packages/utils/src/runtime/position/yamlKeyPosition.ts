export function yamlKeyPosition(json: string, path: string[]) {
  let lines = json.split('\n')
  let acu = 0
  for (let key of path) {
    let rx = RegExp(`^\\s*${key}`)
    let idx = lines.findIndex(x => rx.test(x))
    if (idx === -1) {
      throw Error(`Invalid path ${path}`)
    }
    acu += idx

    lines = lines.slice(idx)
  }
  return { line: acu + 1 }
}
