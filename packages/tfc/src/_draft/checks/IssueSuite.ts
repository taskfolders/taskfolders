import { indent } from '@taskfolders/utils/native/string/indent'
import { getCallingFile } from '../next/getCallingFile.js'
import { NodeLogger } from '../next/Logger.js'
import { diff } from './_draft/diff.js'

import { fileURLToPath } from 'url'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'
const __filename = fileURLToPath(import.meta.url)

const log = new NodeLogger()
type FixDSL = {
  code?
  title: string
  before?: string | object
  after?: string | object
}

class HandlerContext {
  log = log
  _warnings = []
  _skips = []
  _errors = []
  _fixes: FixDSL[] = []

  warn(reason?: string) {
    this._warnings.push({ reason })
    return { warn: { reason } } satisfies HandlerOutput
  }

  skip(reason?: string) {
    this._skips.push({ reason })
    return { skip: { reason } } satisfies HandlerOutput
  }

  fail(reason?: string) {
    return { error: { reason } } satisfies HandlerOutput
  }
  error(reason?: string) {
    this._errors.push({ reason })
    return { error: { reason } } satisfies HandlerOutput
  }

  fix(thing: string | FixDSL) {
    let kv = { title: '-unknown-' }
    if (typeof thing === 'string') {
      kv.title = thing
    } else {
      kv = thing
    }
    this._fixes.push(kv)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} >`
  }
}

type PromiseMaybe<T> = T | Promise<T>
type HandlerOutput = {
  skip?: { reason: string }
  error?: { reason: string }
  fix?: { reason: string }
  warn?: { reason: string }
}
type HandlerFunction = (
  ctx: HandlerContext,
) => PromiseMaybe<HandlerOutput | void>

type Result = {
  title
  error?: any
  skip?
}
type FinalResult = {
  title
  error?: any
  skip?
  ctx: HandlerContext
  caller: ReturnType<typeof getCallingFile>
}

class IssueSuiteError extends Error {
  code: string
  results: Result[]
}

export class IssueSuite {
  _tests: { title; execute: HandlerFunction; caller? }[] = []
  title: string
  constructor(kv: { title?: string } = {}) {
    if (kv.title) this.title = kv.title
  }

  // test(cb: HandlerFunction)
  // test(code: string, cb: HandlerFunction)
  test: {
    (cb: HandlerFunction): IssueSuite
    (code: string, cb: HandlerFunction): IssueSuite
  } = (t1, t2?) => {
    let caller = getCallingFile(__filename, { afterFileName: __filename })

    try {
      let cb
      let title
      if (typeof t1 === 'function') {
        cb = t1
        title = '_untitled_'
      } else {
        title = t1
        cb = t2
      }
      this._tests.push({
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

      ctx.log.put(`${label}: ${test.title}`)
      let log = ctx.log.indent()

      for (let warn of ctx._warnings) {
        let label = log.style.yellow('warn')
        let reason = warn.reason ?? '(no reason given)'
        label = padEnd(label, labelPad)
        log.put(`${label} ${reason}`)
      }

      for (let warn of ctx._errors) {
        let label = log.style.red('error')
        let reason = warn.reason ?? '(no reason given)'
        label = padEnd(label, labelPad)
        log.put(`${label} ${reason}`)
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

      // if (res) {
      //   if (res.skip) {
      //     let reason = res.skip.reason ?? '(no reason given)'
      //     result.skip = reason
      //     let label = log.style.yellow('skip')
      //     log.info(`${label}: ${reason}`)
      //   }
      // }
      log.dedent()
    }

    log.put().put('::SUITE END::')
    log.put(stats)
  }

  async execute() {
    let acu: FinalResult[] = []

    // console.log(`IssueSuite "${this.title}" started`)
    for (let test of this._tests) {
      let ctx = new HandlerContext()
      let result = { title: test.title } as Result
      try {
        let res = await test.execute(ctx)
      } catch (error) {
        result.error = error
      } finally {
        // log.dedent()
      }
      acu.push({ title: result.title, ctx, caller: test.caller })
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

    let stats = { errors: 0 }
    acu.forEach(item => {
      if (item.error) {
        stats.errors++
      } else if (item.ctx._errors.length > 0) {
        stats.errors++
      }
    })
    await this._print(acu)

    if (stats.errors > 0) {
      process.exitCode = 1
    }
  }
}

const skip = (reason?: string) => {
  return { skip: { reason } } satisfies HandlerOutput
}
