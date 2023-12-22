import { ScreenPrinter } from '../screen/ScreenPrinter'
import { printLogEventInNode } from './_node/printLogEventInNode'
import { isNodeRuntime } from '../runtime/isNodeRuntime'

export type LogLevels = 'trace' | 'debug' | 'info' | 'dev' | 'warn' | 'error'

function printLogEventInBrowser(ops: { screen: ScreenPrinter; log: LogEvent }) {
  console.log(...ops.log.args)
}

let levelNumbers: Record<LogLevels, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  dev: 4,
  warn: 5,
  error: 6,
}

type LogArgs = [message: string | Object] | [message: any, obj: any]

function createLogLevel(level: LogLevels) {
  return function (...args: LogArgs) {
    this.logRaw({ args, level })
  }
}

export interface LogEvent {
  message?: string
  args?: LogArgs
  level?: string
}

export class Logger {
  _screen = new ScreenPrinter()
  level: LogLevels = 'info'

  constructor() {
    let envLevel = process.env.LOG_LEVEL
    if (envLevel) {
      if (levelNumbers[envLevel]) {
        this.level = envLevel as LogLevels
      }
    } else {
      let envNode = process.env.NODE_ENV
      if (envNode === 'production') {
        this.level = 'warn'
      } else if (envNode === 'test') {
        this.level = 'error'
      } else {
        this.level = 'info'
      }
    }
  }

  logRaw(kv: LogEvent) {
    // STEP filter threshold
    let level_given = levelNumbers[kv.level]
    let level_threshold = levelNumbers[this.level]
    let has = level_given >= level_threshold
    if (!has) {
      return
    }
    let screen = this._screen

    if (isNodeRuntime()) {
      printLogEventInNode({ log: kv, screen })
    } else {
      printLogEventInBrowser({ log: kv, screen })
    }
  }

  trace = createLogLevel('trace')
  debug = createLogLevel('debug')
  info = createLogLevel('info')
  dev = createLogLevel('dev')
  warn = createLogLevel('warn')
  error = createLogLevel('error')
}
