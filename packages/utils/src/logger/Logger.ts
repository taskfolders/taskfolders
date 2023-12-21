import { ScreenPrinter } from '@taskfolders/utils/screen/ScreenPrinter'
import { FindCaller } from '../stack/locate/FindCaller'
import { shellHyperlink } from '../screen/shellHyperlink'
import { inspect } from 'node:util'

type LogLevels = 'trace' | 'debug' | 'info' | 'dev' | 'warn' | 'error'

let levelColors: Record<LogLevels, string> = {
  trace: 'grey',
  debug: 'cyan',
  info: 'blue',
  dev: 'yellow',
  warn: 'yellow',
  error: 'red',
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

interface LogEvent {
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
      }
      if (envNode === 'test') {
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

    let location = FindCaller.whenNotProduction({ offset: 2 })

    let th = this._screen.style
    let levelName = kv.level ?? 'info'
    let color = levelColors[levelName]
    let colorize = th.color[color] ?? (x => x)
    let level = colorize(levelName.toUpperCase().padEnd(5))

    //level = th.color[levelColors[level]](level);
    if (location) {
      let t1 = shellHyperlink({
        text: level,
        path: location.path,
        lineNumber: location.lineNumber,
        scheme: 'vscode',
      })
      level = t1
    }
    level = `[${level}]`
    let message = kv.args[0]
    let second
    if (typeof kv.args[0] === 'object') {
      message = `{${th.color.magenta('object')}}`
      second = inspect(kv.args[0], { colors: true })
    }

    this._screen.log([level, message])
    if (second) {
      this._screen.indent().log(second)
    }
  }

  trace = createLogLevel('trace')
  debug = createLogLevel('debug')
  info = createLogLevel('info')
  dev = createLogLevel('dev')
  warn = createLogLevel('warn')
  error = createLogLevel('error')
}
