import { indent } from '@taskfolders/utils/native/string/indent'
import { getCallingFile } from '../next/getCallingFile.js'
import { Logger } from '../next/Logger.js'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)

const log = new Logger()
type FixDSL = {
  code?
  title: string
  before?: string | object
  after?: string | object
}

class HandlerContext {
  log = log
  _warnings = []
  _errors = []
  _fixes: FixDSL[] = []

  warn(reason?: string) {
    this._warnings.push({ reason })
    return { warn: { reason } } satisfies HandlerOutput
  }
  skip = skip

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
  skip = skip

  async execute() {
    let acu: Result[] = []

    // console.log(`IssueSuite "${this.title}" started`)
    for (let test of this._tests) {
      let ctx = new HandlerContext()
      // let caller = getCallingFile(__filename, { debug: true })
      let label = 'test'
      if (test.caller) {
        label = Logger.link({
          path: test.caller.path,
          lineNumber: test.caller.lineNumber,
          text: label,
        })
      }

      console.log(`${label}: ${test.title}`)
      let result = { title: test.title } as Result
      try {
        let res = await test.execute(ctx)
        let log = ctx.log.indent()

        for (let warn of ctx._warnings) {
          let label = log.style.yellow('warn')
          let reason = warn.reason ?? '(no reason given)'
          log.put(`${label}: ${reason}`)
        }
        for (let warn of ctx._errors) {
          let label = log.style.red('error')
          let reason = warn.reason ?? '(no reason given)'
          log.put(`${label}: ${reason}`)
        }
        for (let fix of ctx._fixes) {
          let label = log.style.green('fix')
          let reason = fix.title ?? '(no reason given)'
          log.put(`${label}: ${reason}`)

          if (fix.after) {
            let json = JSON.stringify(fix.after, null, 2)
            let txt = indent(json, log.options.padding + 2)

            log.put(txt)
          }
        }

        if (res) {
          if (res.skip) {
            let reason = res.skip.reason ?? '(no reason given)'
            result.skip = reason
            let label = log.style.yellow('skip')
            log.info(`${label}: ${reason}`)
          }
        }
      } catch (error) {
        result.error = error
      } finally {
        log.dedent()
      }
      acu.push(result)
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
}

const skip = (reason?: string) => {
  return { skip: { reason } } satisfies HandlerOutput
}
