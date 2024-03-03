import * as Path from 'node:path'
import * as node_fs from 'node:fs'

interface FindUpOptions {
  fs?: typeof node_fs
  startFrom: string
  many?: boolean
  findName?
  test?(x: string): string | undefined
}

export function findUpAll(kv: FindUpOptions): string[] {
  let options = kv
  let fs = kv.fs ?? node_fs
  let found = []
  let test = options.test
  if (!test) {
    test = x => {
      let path = Path.join(x, options.findName)
      if (fs.existsSync(path)) {
        return path
      }
    }
  }
  let parts = options.startFrom.split(Path.sep)
  let acu = []
  while (parts.length > 0) {
    let current = parts.join(Path.sep)
    if (current === '') current = Path.sep
    let found = test(current)
    if (found) {
      if (options.many === false) return [found]
      acu.push(found)
    }
    parts.pop()
  }
  return acu
}
