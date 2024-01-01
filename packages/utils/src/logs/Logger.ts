import { FindCaller } from '../stack/locate/FindCaller'
import { LogServer } from './LogServer'
import { LogLevelName } from './helpers'
import { getCallerFile } from '../stack/locate/getCallerFile'

interface LogOptions {
  depth?: number
  inspect?: boolean
  forceLink?: boolean
}

type LogArgs = [message: string | Object, obj?: any, options?: LogOptions]

function createLogLevelFunction(level: LogLevelName) {
  return function (this: Logger, ...args: LogArgs) {
    this.logRaw({ args, levelName: level })
    return args[0]
  }
}

export interface LogEvent {
  // message?: string
  args?: LogArgs
  levelName?: LogLevelName
  loggerName?: string
  options?: LogOptions
}

interface UserLogEvent {
  level: LogLevelName
  message: string

  // options
  depth?: number
  inspect?: boolean
  forceLink?: boolean
}

export class Logger {
  server = LogServer.request()
  name: string

  constructor() {}

  logRaw(kv: LogEvent) {
    let ev = { ...kv, loggerName: this.name, options: kv.args.at(2) ?? {} }
    this.server.handleLog(ev)
  }

  raw(kv: UserLogEvent) {
    let options: LogOptions = {
      depth: kv.depth,
      inspect: kv.inspect,
      forceLink: kv.forceLink,
    }
    let ev: LogEvent = { args: [kv.message], options }
    this.logRaw(ev)
  }

  trace = createLogLevelFunction('trace')
  debug = createLogLevelFunction('debug')
  info = createLogLevelFunction('info')
  dev = createLogLevelFunction('dev')
  warn = createLogLevelFunction('warn')
  error = createLogLevelFunction('error')
}
