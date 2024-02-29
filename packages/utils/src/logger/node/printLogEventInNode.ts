import { FindCaller } from '../../stack/locate/FindCaller.js'
import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { inspect } from 'node:util'
import { type LogLevelName } from '../helpers.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'
import { LogEvent } from '../BaseLogger.js'
import { CodePosition } from '../../stack/locate/CodePosition.js'
import { passThreshold } from '../passThreshold.js'

const levelColors: Record<LogLevelName, string> = {
  trace: 'grey',
  debug: 'cyan',
  info: 'blue',
  dev: 'yellow',
  warn: 'yellow',
  error: 'red',
}

function hasShellLinks(key: string) {
  let value = process.env.TASKFOLDERS_SHELL_LINKS
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
      })
      level = t1
    }
    return level
  }

  return (log: LogEvent) => {
    let location: CodePosition

    // TODO #review why fail with bun
    if (log.options.forceLink) {
      location = FindCaller.here({ offset: 4 })
    } else {
      if (hasShellLinks('log')) {
        if (passThreshold({ level: log.levelName, threshold: 'info' })) {
          location = FindCaller.whenDevelopment({ offset: 4 })
        }
      }
    }

    // TODO agin
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

    let oneLine = log.args
      .map(x => {
        if (typeof x === 'string') return x
        return inspect(x, { colors: true })
      })
      .join(' ')
    if (oneLine.length < 70) {
      screen.log([level, loggerName, oneLine])
      return
    }

    let parts = [level, loggerName, first]
    screen.log(parts)

    //console.log(inspect(log.args, { colors: true }))
    if (second) {
      screen.indent().log(second)
    }
  }
}
