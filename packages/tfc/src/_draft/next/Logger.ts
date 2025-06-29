import { inspect } from 'util'
import * as Color from 'colorette'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'

import { shellHyperlink } from '@taskfolders/utils/screen'

const Col = Color.createColors({ useColor: true })

const levelColors = {
  info: 'cyan',
  warn: 'yellow',
  dev: 'yellow',
  error: 'red',
  debug: 'white',
  trace: 'gray',
}
let colorizeLevel = level => {
  level = Col[levelColors[level]](level.toUpperCase())
  if (level === 'dev') {
    level = Col.bold(level)
  }
  return level
}

export class Logger {
  static link = shellHyperlink
  static style = Col

  options: {
    start?: Date
    depth?: number
    padding: number
  } = { padding: 0 }
  data = {}

  style = Col

  link = shellHyperlink

  info(...args) {
    this.raw({ args, level: 'info' })
  }
  warn(...args) {
    this.raw({ args, level: 'warn' })
  }

  debug(...args) {
    this.raw({ args, level: 'debug' })
  }
  dev(...args) {
    this.raw({ args, level: 'dev' })
  }
  error(...args) {
    this.raw({ args, level: 'error' })
  }

  time(cb?: () => Promise<any>) {
    if (cb) {
      this.options.start = new Date()
      return cb().then(() => {
        this.timeEnd()
      })
    } else {
      this.options.start = new Date()
      return this
    }
  }
  timeEnd() {
    let diff = Date.now() - this.options.start.getTime()
    console.log('[DEV:time]', diff, 'ms')
    return this
  }

  indent() {
    this.options.padding += 2
    return this
  }
  dedent() {
    this.options.padding -= 2
    return this
  }
  group() {
    this.options.padding += 2
    return this
  }
  groupEnd() {
    this.options.padding -= 2
    return this
  }

  raw(kv: { level?; message?; args?; depth? }) {
    let { args } = kv

    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        args = [inspect(args[0], { depth: null, colors: true })]
      }
    } else if (args.length === 2) {
      if (typeof args[1] === 'object') {
        args = [args[0], inspect(args[1], { depth: null, colors: true })]
      }
    }

    let level = colorizeLevel(kv.level)
    let caller = getCallingFile(__filename)
    if (caller) {
      level = shellHyperlink({
        text: level,
        path: caller.path,
        lineNumber: caller.lineNumber,
      })
    }
    if (this.options.padding) {
      args = [' '.repeat(this.options.padding), ...args]
    }

    let t1 = padEnd(`[${level}]`, 7)
    console.log(t1, ...args)
    if (!isEmpty(this.data)) {
      let data = inspect(this.data, { depth: null, colors: false })
      data = Col.dim(data)
      console.log(' '.repeat(this.options.padding), '  |', data)
    }
    return this
  }

  print(cb: (ctx: { link: typeof shellHyperlink }) => any) {
    let ctx = { link: shellHyperlink }
    console.log(...[].concat(cb(ctx)))
  }

  put(...args) {
    if (this.options.padding) {
      args = [' '.repeat(this.options.padding), ...args]
    }
    console.log(...args)
    return this
  }

  deep() {
    let next = new Logger()
    return next
  }
  child() {
    let copy = new Logger()
    copy.options = { ...this.options }
    // return one shot parametrize logger
    return this
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} >`
  }
}

function isEmpty(data: {}) {
  return Object.keys(data).length === 0
}

function getCallingFile(__filename: string) {
  const origPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const err = new Error()
  const stack = err.stack as unknown as NodeJS.CallSite[]
  Error.prepareStackTrace = origPrepareStackTrace

  // Find the first callsite outside this file
  for (let i = 0; i < stack.length; i++) {
    const fileName = stack[i].getFileName()
    if (fileName && fileName !== __filename) {
      return { path: fileName, lineNumber: stack[i].getLineNumber() }
    }
  }
  return undefined
}
