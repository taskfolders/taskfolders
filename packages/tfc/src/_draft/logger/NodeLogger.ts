import { inspect } from 'util'
import * as Color from 'colorette'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'

import { shellHyperlink } from '@taskfolders/utils/screen'

import { URL } from 'node:url' // in Browser, the URL in native accessible on window
import { getCallingFile } from '../next/getCallingFile.js'
import { indent } from '@taskfolders/utils/native/string/indent'

const __filename = new URL('', import.meta.url).pathname

const Col = Color.createColors({ useColor: true })

const levelColors = {
  info: 'cyan',
  warn: 'yellow',
  dev: 'yellow',
  error: 'red',
  debug: 'white',
  trace: 'gray',
}

const LogLevels = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  dev: 3,
  error: 4,
  fatal: 5,
  off: 6,
}
type LevelName = keyof typeof LogLevels

const threshold_value = LogLevels[process.env.LOG_LEVEL ?? 'info']

let colorizeLevel = (level: LevelName): string => {
  level = Col[levelColors[level]](level.toUpperCase())
  if (level === 'dev') {
    level = Col.bold(level) as any
  }
  return level
}

export class NodeLogger {
  static link = shellHyperlink
  static style = Col

  options: {
    start?: Date
    depth?: number
    padding: number
    paddingLog: number
  } = { padding: 0, paddingLog: 0 }
  data = {}

  style = Col

  link = shellHyperlink

  info(...args) {
    this.raw({ args, level: 'info' })
    return this
  }
  warn(...args) {
    this.raw({ args, level: 'warn' })
    return this
  }

  debug(...args) {
    this.raw({ args, level: 'debug' })
    return this
  }
  dev(...args) {
    this.raw({ args, level: 'dev' })
    return this
  }

  error(...args) {
    this.raw({ args, level: 'error' })
    return this
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

  clone() {
    // WARNING port changes here to NodeLoggerTesting

    let next = new NodeLogger()
    next.options = JSON.parse(JSON.stringify(this.options))
    return next
  }

  indent() {
    let copy = this.clone()
    copy.options.padding += 2
    copy.options.paddingLog += 2
    return copy
  }

  dedent() {
    let copy = this.clone()
    copy.options.padding -= 2
    return copy
  }

  /** @deprecated */
  group() {
    this.options.padding += 2
    return this
  }
  /** @deprecated */
  groupEnd() {
    this.options.padding -= 2
    return this
  }

  raw(kv: { level?: LevelName; message?; args?; depth? }) {
    let { args } = kv

    if (LogLevels[kv.level] < threshold_value) return

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
    let caller = getCallingFile(__filename, {
      afterFileName: __filename,
    })
    if (caller) {
      level = shellHyperlink({
        text: level,
        path: caller.path,
        lineNumber: caller.lineNumber,
      })
    }
    if (this.options.padding) {
      // args = [' '.repeat(this.options.padding), ...args]
    }

    let t1 = padEnd(`[${level}]`, 7)

    let line = [' '.repeat(this.options.paddingLog) + t1, ...args].join(' ')
    this._rawPrint(line)
    if (!isEmpty(this.data)) {
      let data = inspect(this.data, { depth: null, colors: false })
      data = Col.dim(data)

      line = [' '.repeat(this.options.padding), '  |', data].join('')
      this._rawPrint(line)
    }
    return this
  }

  _rawPrint(line: string) {
    console.log(line)
  }

  print(cb: (ctx: { link: typeof shellHyperlink }) => any) {
    let ctx = { link: shellHyperlink }
    console.log(...[].concat(cb(ctx)))
  }

  put(...args) {
    let txt = args
      .map(x => {
        if (typeof x === 'string') return x
        return inspect(x, { colors: true })
      })
      .join('')
    if (this.options.padding) {
      txt = indent(txt, this.options.padding)
      // args = [' '.repeat(this.options.padding), ...args]
    }
    this._rawPrint(txt)
    return this
  }

  deep() {
    let next = new NodeLogger()
    return next
  }
  child() {
    let copy = new NodeLogger()
    copy.options = { ...this.options }
    // return one shot parametrize logger
    return this
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} >`
  }
}

function isEmpty(data: any) {
  return Object.keys(data).length === 0
}
