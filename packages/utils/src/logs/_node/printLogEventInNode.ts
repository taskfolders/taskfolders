import { FindCaller } from '../../stack/locate/FindCaller'
import { shellHyperlink } from '../../screen/shellHyperlink'
import { inspect } from 'node:util'
import type { LogLevelName } from '../helpers'
import { ScreenPrinter } from '../../screen/ScreenPrinter'
import { LogEvent } from '../Logger'

const levelColors: Record<LogLevelName, string> = {
  trace: 'grey',
  debug: 'cyan',
  info: 'blue',
  dev: 'yellow',
  warn: 'yellow',
  error: 'red',
}

export const printLogEventInNode = (screen?: ScreenPrinter) => {
  screen ??= new ScreenPrinter()
  return (log: LogEvent) => {
    let location = FindCaller.whenDevelopment({ offset: 4 })
    // let err = new Error()
    // console.log('..', err.stack.split('\n').slice(6, 7))
    // console.log(x)

    let th = screen.style
    let levelName = log.levelName ?? 'info'
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
    let message = log.args[0]
    let second
    if (typeof log.args[0] === 'object') {
      message = `{${th.color.magenta('object')}}`
      second = inspect(log.args[0], { colors: true })
    }

    screen.log([level, message])
    if (second) {
      screen.indent().log(second)
    }
  }
}
