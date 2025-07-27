import fsRaw from 'node:fs'
import Path from 'path'

export const dirTaskfoldersData =
  (dir: string) =>
  (path: string | string[], kv: { ensureDir?; fs?: typeof fsRaw } = {}) => {
    let fs = kv.fs || fsRaw
    let dataDir = Path.join(dir, '_data/taskfolders.com')
    if (kv.ensureDir) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    return Path.join(dataDir, ...[].concat(path))
  }
