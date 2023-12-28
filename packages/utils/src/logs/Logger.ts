import { FindCaller } from '../stack/locate/FindCaller'
import { LogServer } from './LogServer'
import { LogLevelName } from './helpers'
import { getCallerFile } from '../stack/locate/getCallerFile'

type LogArgs = [
  message: string | Object,
  obj?: any,
  options?: { depth?: number; inspect?: boolean },
]

function createLogLevelFunction(level: LogLevelName) {
  return function (this: Logger, ...args: LogArgs) {
    this.logRaw({ args, levelName: level })
    return args[0]
  }
}

export interface LogEvent {
  message?: string
  args?: LogArgs
  levelName?: LogLevelName
  loggerName?: string
}

export class Logger {
  server = LogServer.request()
  name: string

  constructor() {}

  logRaw(kv: LogEvent) {
    this.server.handleLog({ ...kv, loggerName: this.name })
  }

  trace = createLogLevelFunction('trace')
  debug = createLogLevelFunction('debug')
  info = createLogLevelFunction('info')
  dev = createLogLevelFunction('dev')
  warn = createLogLevelFunction('warn')
  error = createLogLevelFunction('error')
}
