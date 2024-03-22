import { getCallerFile } from '@taskfolders/utils/runtime/stack'
import { dirname } from 'path'
import * as fs from 'fs'
import { join } from 'node:path'
import { ScriptStatus } from './ScriptStatus.js'

interface DSL {
  dirData?: string | boolean
  dirBuild?: string
  execute: any
}

interface ExecuteContext {}

export class ScriptApp {
  static classId = 'taskfolders.com:FolderScript'
  source: any
  fs = fs
  definition?: DSL
  dirScript?: string
  dirData?: string

  static is(thing: any): thing is ScriptApp {
    let lhs = thing?.constructor?.classId
    let rhs = this.classId
    return lhs === rhs
  }

  static create(
    thing: DSL | ((ctx: any) => { exitCode?: number } | void | Promise<any>),
  ): ScriptApp {
    let obj = new this()
    obj.source = getCallerFile({ afterFile: import.meta.url })

    if (typeof thing === 'function') {
      obj.definition = { execute: thing }
    } else {
      obj.definition = thing
    }
    Object.defineProperty(obj, 'fs', { enumerable: false })
    obj.finish()

    return obj
  }

  finish() {
    let data = this.definition?.dirData
    let dirScript = dirname(this.source.path)
    if (data) {
      let path = typeof data === 'string' ? data : '_data'
      this.dirData = join(dirScript, path)
    }
  }

  async writeStatus(kv: { ok: any; result: any; start?: Date }) {
    let { fs } = this
    let dirScript = dirname(this.source.path)
    let { start } = kv

    fs.mkdirSync(join(dirScript, '_data'), { recursive: true })
    let statusFile = join(dirScript, '_data/index.json')
    let data = new ScriptStatus({ error: !kv.ok, start })
    data.result = kv.result
    fs.writeFileSync(statusFile, JSON.stringify(data, null, 2))
  }

  async execute() {
    if (!this.definition) throw new Error('No script definition')
    let ctx = { script: this }
    let ok = true
    let result
    let start = new Date()
    try {
      result = await this.definition.execute(ctx)
    } catch (e) {
      ok = false
    }
    if (this.dirData) {
      await this.writeStatus({ ok, result, start })
    }
    return result
  }

  async runFromShell() {
    let res = await this.execute()
    if (res?.exitCode) {
    }
  }
}
