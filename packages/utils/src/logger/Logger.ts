import { LogServer } from './LogServer.js'
import { LogLevelName } from './helpers.js'

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
  levelName: LogLevelName
  levelValue?: number
  loggerName?: string
  options?: LogOptions
}

interface UserLogEvent {
  level: LogLevelName
  message?: string
  data?: Record<string, unknown>

  // options
  depth?: number
  inspect?: boolean
  forceLink?: boolean
}

export class Logger {
  server = LogServer.request()
  name: string

  constructor() {}

  _logRaw(kv: LogEvent) {
    let ev = { ...kv, loggerName: this.name, options: kv.args.at(2) ?? {} }
    this.server.handleLog(ev)
  }

  raw(kv: UserLogEvent) {
    let options: LogOptions = {
      depth: kv.depth,
      inspect: kv.inspect,
      forceLink: kv.forceLink,
    }
    let ev: LogEvent = { levelName: kv.level, args: [kv.message], options }
    this._logRaw(ev)
  }

  trace = createLogLevelFunction('trace')
  debug = createLogLevelFunction('debug')
  info = createLogLevelFunction('info')
  dev = createLogLevelFunction('dev')
  warn = createLogLevelFunction('warn')
  error = createLogLevelFunction('error')
}
