import type { SourcePosition } from '../runtime/position/SourcePosition.js'
import { LogServer } from './LogServer.js'
import { LogLevelName } from './helpers.js'
import { passThreshold } from './passThreshold.js'
import { ScreenPrinter } from '../screen/ScreenPrinter.js'
import { ConsoleTheme } from '../screen/ConsoleTheme.js'

interface LogOptions {
  depth?: number
  inspect?: boolean
  forceLink?: boolean
}

//type LogArgs = [message: string | Object, obj?: any, options?: LogOptions]

function createLogLevelFunction(level: LogLevelName) {
  return function (this: Logger, ...args: any[]) {
    this._logRaw({ args, levelName: level })
    return args[0]
  }
}

export interface LogEvent {
  args?: any[]
  messageBuilder?: () => any[]
  levelName: LogLevelName
  levelValue?: number
  loggerName?: string
  options?: LogOptions
  location?: SourcePosition
}

interface UserLogEvent {
  level: LogLevelName
  message?: string | (() => string | any[])
  data?: Record<string, unknown>

  // options
  depth?: number
  inspect?: boolean
  forceLink?: boolean
}

type foo = Parameters<ScreenPrinter['log']>

export class Logger {
  server = LogServer.request()
  name: string
  screen = new ScreenPrinter()

  put(thing: (theme: ConsoleTheme) => any, kv?: LogOptions): ScreenPrinter
  put(string, kv?: LogOptions): ScreenPrinter
  put(): ScreenPrinter
  put(thing: unknown = '', kv: LogOptions = {}): ScreenPrinter {
    // @ts-expect-error TODO
    return this.screen.log(thing, kv)
  }

  constructor() {
    this.put = this.screen.log.bind(this.screen)
  }

  _logRaw(kv: LogEvent) {
    let log = { ...kv, loggerName: this.name, options: kv.args.at(2) ?? {} }
    if (passThreshold({ level: log.levelName, threshold: 'info' })) {
      // TODO ???
      // log.location = getCallerFile()
    }

    this.server.handleLog(log)
  }

  raw(kv: UserLogEvent) {
    let options: LogOptions = {
      depth: kv.depth,
      inspect: kv.inspect,
      forceLink: kv.forceLink,
    }
    let ev: LogEvent = { levelName: kv.level, args: [kv.message], options }
    if (typeof kv.message === 'function') {
      ev.args = []
      // @ts-expect-error TODO
      ev.messageBuilder = kv.message
    }
    this._logRaw(ev)
  }

  trace = createLogLevelFunction('trace')
  debug = createLogLevelFunction('debug')
  info = createLogLevelFunction('info')
  dev = createLogLevelFunction('dev')
  warn = createLogLevelFunction('warn')
  error = createLogLevelFunction('error')

  log(a, ...x) {
    return this.screen.log(a, ...x)
  }
}
