import { indent } from '@taskfolders/utils/native/string/indent'
import { getCallingFile } from '../next/getCallingFile.js'
import { NodeLogger } from '../next/Logger.js'
import { diff } from './_draft/diff.js'

import { fileURLToPath } from 'url'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'
const __filename = fileURLToPath(import.meta.url)

const log = new NodeLogger()
type FixDSL = {
  code?: string
  title?: string
  before?: string | object
  after?: string | object
}

class HandlerContext {
  log = log
  config: RuleConfigRecord
  _warnings = []
  _skips = []
  _errors = []
  _fixes: FixDSL[] = []

  _pending
  _config_fixes: {}

  pending() {
    this._pending = true
  }

  warn(reason?: string) {
    this._warnings.push({ reason })
  }

  skip(reason?: string) {
    this._skips.push({ reason })
  }

  fail(thing?: string | { title; data? }) {
    let kv
    if (typeof thing === 'string') {
      kv = { reason: thing }
    } else {
      kv = { reason: thing.title, data: thing.data }
    }
    if (this.config?.level === 'warning') {
      this._warnings.push(kv)
    } else {
      this._errors.push(kv)
    }
  }

  /** @deprecated use .fail */
  error() {
    throw Error('invalid action')
  }

  fix(thing: string | FixDSL, cbFix?) {
    let kv: FixDSL = { code: '-unknown-' }
    if (typeof thing === 'string') {
      kv.code = thing
    } else {
      kv = thing
    }
    if (cbFix) {
      if (this._config_fixes[kv.code]) {
        return cbFix()
      }
    }
    this._fixes.push(kv)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} >`
  }
}

type PromiseMaybe<T> = T | Promise<T>
type HandlerFunction = (ctx: HandlerContext) => PromiseMaybe<void>

type FinalResult = {
  code: string
  title?: string
  error?: any
  skip?
  ctx: HandlerContext
  caller: ReturnType<typeof getCallingFile>
}

class IssueSuiteError extends Error {
  code: string
  results: FinalResult[]
}

type Level = 'warning' | 'error'
type Status = 'warning' | 'error' | 'pass' | 'pending' | 'skip'
type RuleConfigRecord = {
  enabled?
  level?: Level
  config?
}

export class IssueSuite {
  _config = { issues: {} as Record<string, RuleConfigRecord>, fixes: {} }

  _tests: {
    code: string
    /**@deprecated */
    title
    execute: HandlerFunction
    caller?
  }[] = []
  title: string
  constructor(kv: { title?: string } = {}) {
    if (kv.title) this.title = kv.title
  }

  // test(cb: HandlerFunction)
  // test(code: string, cb: HandlerFunction)
  test: {
    (cb: HandlerFunction): IssueSuite
    (code: string, cb?: HandlerFunction): IssueSuite
  } = (t1, t2?) => {
    let caller = getCallingFile(__filename, { afterFileName: __filename })

    try {
      let cb
      let title
      if (typeof t1 === 'function') {
        cb = t1
        // title = '_untitled_'
      } else {
        title = t1
        cb =
          t2 ??
          (t => {
            t.pending()
          })
      }
      this._tests.push({
        code: title,
        title,
        execute: cb,
        caller,
      })
    } catch (error) {
      console.error(`IssueSuite: ${this.title} failed`, error)
      // throw error
    }
    return this
  }

  log = log

  async _print(all: FinalResult[]) {
    let labelPad = 7
    let stats = { skip: 0, pass: 0, error: 0, fix: 0 }
    for (let test of all) {
      let ctx = test.ctx
      // let caller = getCallingFile(__filename, { debug: true })
      let label = 'test'
      if (test.caller) {
        label = NodeLogger.link({
          path: test.caller.path,
          lineNumber: test.caller.lineNumber,
          text: label,
        })
      }

      ctx.log.put(`${label}: ${test.code ?? test.title}`)
      let log = ctx.log.indent()

      for (let warn of ctx._warnings) {
        let label = log.style.yellow('warn')
        let reason = warn.reason ?? '(no reason given)'
        label = padEnd(label, labelPad)
        log.put(`${label} ${reason}`)
      }

      for (let error of ctx._errors) {
        let label = log.style.red('error')
        let reason = error.reason ?? '(no reason given)'
        label = padEnd(label, labelPad)
        log.put(`${label} ${reason}`)
        if (error.data) {
          log.indent().put(error.data).dedent()
        }
        stats.error++
      }
      for (let warn of ctx._skips) {
        let label = log.style.cyan('skip')
        let reason = warn.reason ?? '(no reason given)'
        label = padEnd(label, labelPad)
        log.put(`${label}: ${reason}`)
        stats.skip++
      }
      for (let fix of ctx._fixes) {
        stats.fix++
        let label = log.style.green('fix')
        label = padEnd(label, labelPad)
        let reason = fix.title ?? '(no reason given)'
        let code = ''
        if (fix.code) {
          code = NodeLogger.style.cyan(fix.code)
          code = ':' + code
        }
        log.put(`${label} ${reason} ${code} `)

        if (fix.after) {
          let txt: string
          if (typeof fix.after !== 'string') {
            txt = JSON.stringify(fix.after, null, 2)
          }
          let before = fix.before
          if (before) {
            if (typeof before !== 'string') {
              before = JSON.stringify(before, null, 2)
            }
            txt = diff({ before, after: txt })
          }
          log.indent().put(':diff:').indent().put(txt).dedent().dedent()
        }
      }

      log.dedent()
    }

    log.put().put('::SUITE END::')
    let copy = { ...stats }
    if (copy.error > 0) {
      copy[log.style.red('error')] = copy.error
      delete copy.error
    }
    let r1 = Object.entries(copy)
      .map(([key, value]) => `${key}=${log.style.yellow(value)}`)
      .join(' ')
    log.put(r1)
  }

  async execute() {
    let acu: FinalResult[] = []

    // console.log(`IssueSuite "${this.title}" started`)
    for (let test of this._tests) {
      let ctx = new HandlerContext()
      let error
      let config = this._config.issues[test.code]
      ctx.config = config
      ctx._config_fixes = this._config.fixes

      if (config?.enabled !== false) {
        try {
          await test.execute(ctx)
        } catch (err) {
          error = err
        }
      } else {
        ctx.skip('disabled in config')
      }
      acu.push({
        code: test.code,
        //title: test.title,
        ctx,
        caller: test.caller,
        error,
      })
    }

    if (acu.some(r => r.error)) {
      // console.error(`IssueSuite "${this.title}" failed`, acu)
      let error = new IssueSuiteError(`IssueSuite "${this.title}" failed`)
      error.code = 'IssueSuite-TestError'
      error.results = acu
      let all = acu.map(x => x.error).filter(Boolean)
      all.forEach(x => {
        log.error('Test error:', x)
      })

      throw error
    }

    return acu
  }

  async executeForShell() {
    let acu = await this.execute()
    let easy = toEasyResult(acu)

    let stats = { errors: 0, pass: 0 }
    easy.forEach(item => {
      if (item.status === 'error') {
        stats.errors++
      } else if (item.status === 'pass') {
        stats.pass++
      }
    })
    // TODO #finish
    // log.dev(easy)
    await this._print(acu)

    if (stats.errors > 0) {
      process.exitCode = 1
    }
  }

  async execute_v2() {
    let res = await this.execute()

    let r1 = toEasyResult(res)
    return r1
  }
}

let toIssueBasic = (type: Level) => x => {
  return {
    type,
    message: x.reason,
  }
}

const toEasyResult = (all: FinalResult[]) => {
  return all.map(result => {
    let issues = [
      ...result.ctx._warnings.map(toIssueBasic('warning')),
      ...result.ctx._errors.map(toIssueBasic('error')),
    ]

    let status: Status = 'pass'
    if (issues.some(x => x.type === 'error')) {
      status = 'error'
    } else if (issues.some(x => x.type === 'warning')) {
      status = 'warning'
    } else if (result.ctx._skips.length > 0) {
      status = 'skip'
    } else if (result.ctx._pending) {
      status = 'pending'
    }
    return { code: result.code, status, issues, fixes: result.ctx._fixes }
  })
}
