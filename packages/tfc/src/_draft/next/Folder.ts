import { MarkdownDocument } from '@taskfolders/utils/markdown'
import fs from 'node:fs'
import Path from 'path'
import { join } from 'path/posix'

export class Folder {
  fs = fs
  data

  constructor(public dir: string) {}

  findBase() {
    //let all = findUpAll({ startFrom: this.dir, findName: 'index.md' })
  }

  async parse() {
    let dir = this.dir

    let files = fs.readdirSync(dir)

    if (files.includes('index.json')) {
      let file = join(dir, 'index.json')
      let json = fs.readFileSync(file, 'utf-8').toString()
      let doc = JSON.parse(json)
      this.data = doc
    } else if (files.includes('index.md')) {
      let file = join(dir, 'index.md')
      let body = fs.readFileSync(file, 'utf-8').toString()
      let md = await MarkdownDocument.fromBody(body, {
        implicitFrontmatter: true,
      })

      this.data = md.data
    } else if (files.includes('index.md.asc')) {
      console.log('TODO gpg asc')
    } else if (files.includes('index.md.gpg')) {
      console.log('TODO gpg asc')
    }
  }

  dataDir(kv: { ensure?; join?: string[] } = {}) {
    let path = join(this.dir, '_data/tf')
    if (kv.ensure) {
      this.fs.mkdirSync(path, { recursive: true })
    }
    if (kv.join) {
      path = join(path, ...kv.join)
    }
    return path
  }

  isWorkspace() {
    if (this.data?.flags?.includes('workspace')) return true
    return this.data?.labels === 'workspace'
  }
  relative(path) {
    return Path.relative(this.dir, path)
  }

  ls(): string[] {
    let files = this.fs.readdirSync(this.dir)
    files = files.filter(file => {
      if (file.startsWith('.')) return false

      return !['node_modules', '.git', '_data', 'venv', '.venv'].includes(file)
    })
    return files
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} ${this.dir}>`
  }
}
