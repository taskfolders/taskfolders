import { FindCaller } from '../../stack/locate/FindCaller'
import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink'
import { inspect } from 'node:util'
import type { LogLevelName } from '../helpers'
import { ScreenPrinter } from '../../screen/ScreenPrinter'
import { LogEvent } from '../Logger'
import { ConsoleTheme } from '../../screen/ConsoleTheme'
import { CodePosition } from '../../stack/locate/CodePosition'

const levelColors: Record<LogLevelName, string> = {
  trace: 'grey',
  debug: 'cyan',
  info: 'blue',
  dev: 'yellow',
  warn: 'yellow',
  error: 'red',
}

function hasShellLinks(key: string) {
  let value = process.env.TF_SHELL_LINKS
  return value?.includes(key)
}

export const printLogEventInNode = (kv: { screen?: ScreenPrinter } = {}) => {
  let screen = kv.screen ?? new ScreenPrinter()
  let th = screen.style

  function makeLabel(log: LogEvent, location: CodePosition) {
    let levelName = log.levelName ?? 'info'
    let color = levelColors[levelName]
    let colorize = th.color[color] ?? (x => x)
    let level = colorize(levelName.toUpperCase().padEnd(6))

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
    return level
  }

  return (log: LogEvent) => {
    let location: CodePosition
    if (log.options.forceLink) {
      location = FindCaller.here({ offset: 4 })
    } else {
      console.log(log)

      if (hasShellLinks('log')) {
        location = FindCaller.whenDevelopment({ offset: 4 })
      }
    }

    // let err = new Error()
    // console.log('..', err.stack.split('\n').slice(6, 7))
    // console.log(x)

    let level = makeLabel(log, location)

    let [first, second, options] = log.args
    let doInspect = (x: Object) =>
      inspect(x, {
        colors: true,
        depth: options?.depth,
        customInspect: options?.inspect ?? true,
      })

    if (first === undefined) {
      first = th.dim('undefined')
    } else if (first === null) {
      first = th.dim('null')
    } else if (typeof first === 'object') {
      let second_before = second
      second = doInspect(first)
      if (second_before) {
        if (typeof second_before === 'string') {
          first = second
        } else {
          // TODO
        }
      } else {
        first = `{${th.color.magenta('object')}}`
        first = th.dim('object')
      }
    }

    if (typeof second === 'object') {
      second = doInspect(second)
    }

    let { loggerName } = log
    if (loggerName) {
      loggerName = th.dim(`[${loggerName}]`)
    }

    let parts = [level, loggerName, first]
    screen.log(parts)
    if (second) {
      screen.indent().log(second)
    }
  }
}
