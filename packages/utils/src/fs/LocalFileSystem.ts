import * as fs from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

export class VFile<T = Record<string, unknown>> {
  path: string
  buffer: Buffer

  constructor(kv: { path: string; value?: any }) {
    this.path = kv.path
    if (typeof kv.value === 'string') {
      this.buffer = Buffer.from(kv.value)
    } else if (kv.path.endsWith('.json') && typeof kv.value === 'object') {
      this.buffer = Buffer.from(JSON.stringify(kv.value))
    }
  }

  get body(): string {
    return this.buffer.toString()
  }

  get json(): T {
    let doc = JSON.parse(this.body)
    return doc
  }
}

export class LocalFileSystem {
  raw = fs

  async read<T>(aPath: string | string[]): Promise<VFile<T>> {
    let path = join(...[].concat(aPath))

    return new Promise((resolve, reject) => {
      this.raw.readFile(path, (err, data) => {
        if (err) reject(err)
        let file = new VFile<T>({ path })
        file.buffer = data
        resolve(file)
      })
    })
  }

  async write(file: VFile, kv?: { pretty?: boolean }): Promise<void>
  async write(aPath: string | string[], data, kv?: { pretty?: boolean })
  async write(first, data, kv?: { pretty?: boolean }) {
    let path: string

    if (typeof first === 'string' || Array.isArray(first)) {
      path = join(...[].concat(first))
    } else {
      path = first.path
      kv = data
      data = first.buffer.toString()
    }

    if (path.endsWith('.json') && typeof data !== 'string') {
      data = JSON.stringify(data, null, kv?.pretty ? 2 : null)
    }

    await new Promise((resolve, reject) => {
      this.raw.writeFile(path, data, err => {
        if (err) reject(err)
        resolve(null)
      })
    })
  }

  exists(path: string) {
    return this.raw.existsSync(path)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let type = 'node-fs'
    return `<${this.constructor.name} ${type}>`
  }
}
