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

  constructor() {
    Object.defineProperty(this, 'raw', { enumerable: false })
  }

  lsSync(aPath: string | string[]) {
    let path = join(...[].concat(aPath))
    let res = this.raw.readdirSync(path)
    return res
  }

  async rm(aPath: string | string[]) {
    let path = join(...[].concat(aPath))
    let res = new Promise((resolve, reject) =>
      this.raw.unlink(path, err => {
        if (err) reject(err)
        resolve(null)
      }),
    )
    return res
  }

  async read<T>(
    aPath: string | string[],
    kv?: { unsafe?: boolean },
  ): Promise<VFile<T>> {
    let path = join(...[].concat(aPath))
    if (kv?.unsafe) {
      if (!this.raw.existsSync(path)) return null
    }

    return await new Promise((resolve, reject) => {
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

  async mv(from: string | string[], to: string | string[]) {
    let p_from = join(...[].concat(from))
    let p_to = join(...[].concat(to))
    let res = new Promise((resolve, reject) =>
      this.raw.rename(p_from, p_to, err => {
        if (err) reject(err)
        resolve(null)
      }),
    )
    return res
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let type = 'node-fs'
    return `<${this.constructor.name} ${type}>`
  }
}
