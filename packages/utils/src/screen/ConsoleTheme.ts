// TODO:utils-dedup
import chalk from 'chalk'

// CSS Color names
// https://www.w3.org/wiki/CSS/Properties/color/keywords

// Color naming? CSS / W3C / X11
// https://jonasjacek.github.io/colors/

export const Colors = {
  developer: 'orange',
  developerHigh: 'hotpink',
}

export class ConsoleTheme {
  prefix: string

  dim = chalk.dim.bind(chalk)

  color = {
    normal: (x: string) => x,
    blue: chalk.blue.bind(chalk),
    green: chalk.green.bind(chalk),
    red: chalk.red.bind(chalk),
    cyan: chalk.cyan.bind(chalk),
    yellow: chalk.yellow.bind(chalk),
    magenta: chalk.magenta.bind(chalk),
  }

  static highlight(x) {
    return chalk.yellow(x)
  }

  static error(x) {
    return chalk.red(x)
  }

  static dim(x) {
    return chalk.keyword('gray')(x)
  }

  static section(x) {
    return chalk.blue(x)
  }

  static devLabel(x: string) {
    return chalk.bgKeyword(Colors.developer).keyword('navy')(x)
  }

  static devToolPrefixed(prefix: string, text, high = false) {
    // return [chalk.keyword(Colors.developer)(`${prefix} |`), text].join(' ')
    let color = high ? Colors.developerHigh : Colors.developer
    return text
      .split('\n')
      .map(line => {
        let pref = prefix ? `${prefix} |` : '|'
        return [chalk.keyword(color)(pref), line].join(' ')
      })
      .join('\n')
  }

  static devToolBoxStart(prefix, ...x) {
    return [chalk.keyword(Colors.developer)(`${prefix} >>>`), ...x].join(' ')
  }

  static devToolBoxEnd(prefix) {
    return chalk.keyword(Colors.developer)(`${prefix} <<<`)
  }

  static developerBlock(prefix, title, body, kv?: { critical }) {
    let critical = kv?.critical
    let lines = []

    // let appTag = chalk.bgKeyword('orange')(chalk.magenta(`${prefix} >`))
    // let tagLabel = chalk.bgHex('#ff8700')(chalk.magenta(` ${prefix} `))
    let tagLabel = critical
      ? chalk.bgKeyword('red')(chalk.keyword('white')(` ${prefix} `))
      : chalk.bgKeyword(Colors.developer)(chalk.keyword('navy')(` ${prefix} `))
    let tagTitle = chalk.keyword(Colors.developer)(title)
    let tt = [tagLabel, tagTitle].join(' ')
    // lines.push(this.devToolBoxStart(prefix, title))
    lines.push(tt)

    let mark = chalk.keyword(Colors.developer)('| ')
    body = body
      .split('\n')
      .map(x => mark + x)
      .join('\n')
    lines.push(body)
    lines.push('')
    return lines.join('\n')
  }

  static textWithLineNumbers(text: string, ops: { suffix? } = {}) {
    let lines = text.split('\n')
    let maxCounterLength = lines.length.toString().length
    let padding = maxCounterLength + 1
    return lines
      .map((x, idx) => {
        let idxLabel = idx.toString()
        if (ops.suffix) {
          idxLabel += ops.suffix
        }
        let number = chalk.keyword(Colors.developer)(idxLabel.padStart(padding))

        return `${number}  ${x}`
      })
      .join('\n')
  }

  devLabel(x: string) {
    return chalk.bgKeyword(Colors.developer).keyword('navy')(x)
  }

  error(x) {
    // return chalk.keyword('hotpink')(x)
    return chalk.red(x)
  }

  warning(x) {
    return chalk.yellow(x)
  }
  highlight(x) {
    return chalk.yellow(x)
  }

  section(x) {
    return chalk.blue(x)
  }
}
