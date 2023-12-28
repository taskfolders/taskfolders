import { FindCaller } from '../../stack/locate/FindCaller'
import { shellHyperlink } from '../../screen/shellHyperlink'
import { inspect } from 'node:util'
import type { LogEvent, LogLevels } from '../Logger'
import { ScreenPrinter } from '../../screen/ScreenPrinter'

const levelColors: Record<LogLevels, string> = {
  trace: 'grey',
  debug: 'cyan',
  info: 'blue',
  dev: 'yellow',
  warn: 'yellow',
  error: 'red',
}

export function printLogEventInNode(ops: {
  screen: ScreenPrinter
  log: LogEvent
}) {
  let { screen, log: kv } = ops

  let location = FindCaller.whenNotProduction({ offset: 2 })

  let th = screen.style
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

  screen.log([level, message])
  if (second) {
    screen.indent().log(second)
  }
}
