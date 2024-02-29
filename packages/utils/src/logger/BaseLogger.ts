import { BaseLogServer } from './BaseLogServer.js'
import { NodeLogger } from './node/NodeLogger.js'
import { LogLevelName } from './helpers.js'
import { FindCaller } from '../stack/locate/FindCaller.js'
import { shellHyperlink } from '../screen/shellHyperlink/shellHyperlink.js'

interface LogOptions {
  depth?: number
  inspect?: boolean
  forceLink?: boolean
}

//type LogArgs = [message: string | Object, obj?: any, options?: LogOptions]

function createLogLevelFunction(level: LogLevelName) {
  return function (this: NodeLogger, ...args: any[]) {
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

export abstract class BaseLogger {
  abstract server: BaseLogServer
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

  // TODO abstract ?
  put(txt: string) {
    let parts = [txt]
    console.log(parts.join(' '))
  }
}
