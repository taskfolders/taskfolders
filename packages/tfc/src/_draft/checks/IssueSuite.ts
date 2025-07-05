import { Logger } from '../next/Logger.js'

const log = new Logger()
class HandlerContext {
  log = log

  warn(reason?: string) {
    return { warn: { reason } } satisfies HandlerOutput
  }
  skip = skip

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
  _tests: { title; execute: HandlerFunction }[] = []
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
      console.log(`test: ${test.title}`)
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
      throw error
    }

    return acu
  }
}

const skip = (reason?: string) => {
  return { skip: { reason } } satisfies HandlerOutput
}
