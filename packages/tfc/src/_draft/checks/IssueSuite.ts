import { getCallingFile } from '../next/getCallingFile.js'
import { Logger } from '../next/Logger.js'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)

const log = new Logger()
class HandlerContext {
  log = log

  warn(reason?: string) {
    return { warn: { reason } } satisfies HandlerOutput
  }
  skip = skip

  fail(reason?: string) {
    return { error: { reason } } satisfies HandlerOutput
  }
  error(reason?: string) {
    return { error: { reason } } satisfies HandlerOutput
  }
  fix(reason?: string) {
    return { fix: { reason } } satisfies HandlerOutput
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
    let ctx = new HandlerContext()

    let acu: Result[] = []

    // console.log(`IssueSuite "${this.title}" started`)
    for (let test of this._tests) {
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
        if (res) {
          if (res.skip) {
            let reason = res.skip.reason ?? '(no reason given)'
            result.skip = reason
            ctx.log.info(`skipped: ${reason}`)
          }
        }
      } catch (error) {
        result.error = error
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
