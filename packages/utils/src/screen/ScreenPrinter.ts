// TODO:utils-dedup

// import { ConsoleTheme } from './ConsoleTheme'
// import { ConsolePrinterProtocol } from './ConsolePrinterProtocol'
import * as chalk from 'chalk'
import { isDebug } from '../runtime/isDebug.js'
// import { Terminal } from './Terminal'
import { ConsoleTheme } from './ConsoleTheme.js'
import { indent } from '../native/string/indent.js'
import { stripAnsiCodes } from '../native/string/stripAnsiCodes.js'

// import { sanitizeString } from '../../native/string/sanitizeString'
// import { decolorize, indent, stripAnsiCodes } from '../../native/string'
// import { parseLineTemplate } from '../../native/string/parseLineTemplate'
// import { isPromise } from '../../native/promise/isPromise'

// import { ObjectPrinter } from './ObjectPrinter/ObjectPrinter_v1'
// import { isDebug } from '../../runtime/isDebug'
// import { nodeEnv } from '../../runtime/isNodeEnv'
// import { FindCaller } from '../../stack'
// import { UserEditorLink } from '../../_draft'
import { shellHyperlink } from './shellHyperlink/shellHyperlink.js'
import { FindCaller } from '../stack/locate/FindCaller.js'
const sanitizeString = x => x
const isPromise = x => false
const decolorize = x => x
const parseLineTemplate = (x, y) => {
  return { text: x }
}
class ObjectPrinter {
  constructor(...x) {}
  print(x?) {
    return '--object--'
  }
}

interface LogOptions {
  indent?: number
  data?: Record<string, unknown>
  template?: boolean
  rewrite?: string
}

/**  collect Lines for console printing */
// TODO
// export class Screen implements ConsolePrinterProtocol {
export class BaseScreenPrinter {
  // FEATURE: Debug mode
  //
  // Print lines while building screen dump
  // you want this when debugging with log messages "while" along each generated line

  debugLive: boolean // echo each generated line with prefix
  debugInline: boolean // prefix each line with developer hyperlink
  padding = 0

  echo: boolean
  liveMode = true
  latest: { input; options: LogOptions }

  constructor(
    kv: {
      debug?: boolean
      debugInline?: boolean
      /** @deprecated */
      echo?: boolean
      liveMode?: boolean
    } = {},
  ) {
    this.debugLive = kv?.debug ?? isDebug('screen')
    this.liveMode =
      process.env.NODE_ENV === 'test' ? false : kv.liveMode ?? true

    if (process.env.NODE_ENV === 'test') {
      this.echo = kv.echo
      this.debugLive = kv.debug ?? false
    }
    // console.log('----', { de: this.debug })
  }

  set debug(x: boolean) {
    this.debugLive = x
  }

  static fromJSON(doc) {
    let obj = new this()
    return obj
  }

  // static debug() {
  //   if (isNodeEnv('production')) throw Error('Not available under TEST')
  //   let original = process.env.SCREEN_DEBUG
  //   process.env.SCREEN_DEBUG = '1'
  //   let { $spec } = require('@zapps/testing')
  //   $spec.after(() => {
  //     if (original) {
  //       process.env.SCREEN_DEBUG = original
  //     } else {
  //       delete process.env.SCREEN_DEBUG
  //     }
  //   })
  // }

  static style = new ConsoleTheme()
  style = new ConsoleTheme()

  create() {
    let obj = new MemoryScreenPrinter()
    obj.debugLive = this.debugLive
    return obj
  }

  #logString(first: unknown = '', kv: LogOptions = {}) {
    // TODO clean duplicated from old .log() #tmp
    let line = indent(first as any, this.padding)

    // TODO #bug high #risk of breaking...  template!
    if (kv.data && kv.template !== false) {
      line = parseLineTemplate(line, kv.data).text
    }
    let newLines = line.split('\n')
    if (this.debugInline) {
      // let loc = myGetCaller()
      let loc = FindCaller.whenDevelopment()
      let label = shellHyperlink({
        text: 'screen',
        path: loc.path,
        lineNumber: loc.lineNumber,
        scheme: 'mscode',
      })
      newLines = newLines.map(line =>
        ConsoleTheme.devToolPrefixed(label, line, true),
      )
    }
    newLines.forEach(x => {
      x = indent(x, kv.indent ?? 0)
      this._pushLine(x)
    })

    if (this.debugLive && process.env.SCREEN !== '0') {
      let loc = FindCaller.whenDevelopment()
      let label = 'screen'
      if (loc) {
        // let loc = myGetCaller()
        // let link = UserEditorLink.fromSource(loc).link()
        label = shellHyperlink({
          text: label,
          path: loc?.path,
          scheme: 'vscode',
          lineNumber: loc?.lineNumber,
        })
      }

      // eslint-disable-next-line
      console.log(ConsoleTheme.devToolPrefixed(label, line, true))
    } else {
      this._printLive(line, kv)
    }

    if (this.echo) {
      // eslint-disable-next-line
      console.log(line)
    }
  }

  _printLive(line: string, ops: LogOptions) {
    if (this.liveMode) {
      let pastRewrite = this.latest?.options?.rewrite
      if (pastRewrite) {
        if (pastRewrite !== ops.rewrite) {
          // console.log('new line - YES')
          process.stdout.write('\n')
        } else {
          // console.log('new line - NO', { pastRewrite, ops })
          // $dev('ok')
        }
      }
      if (this.debugInline !== true) {
        if (ops.rewrite) {
          process.stdout.clearLine(0)
          process.stdout.cursorTo(0)
          process.stdout.write(line)
        } else {
          // eslint-disable-next-line
          console.log(line)
        }
      } else {
        let loc = FindCaller.whenDevelopment()
        // let loc = myGetCaller()
        let label = shellHyperlink({
          text: 'screen',
          path: loc.path,
          lineNumber: loc.lineNumber,
          scheme: 'mscode',
        })
        // eslint-disable-next-line
        console.log(ConsoleTheme.devToolPrefixed(label, line, true))
      }
    }
  }

  merge(x) {}

  log2(thing: unknown = '', kv: LogOptions = {}) {
    if (typeof thing === 'string') {
      this.#logString(thing, kv)
    } else if (typeof thing === 'number') {
      this.#logString(thing.toString(), kv)
    } else if (typeof thing === 'function') {
      this.log(thing(this.style), kv)
    } else if (thing instanceof MemoryScreenPrinter) {
      this.merge(thing)
    } else if (isPromise(thing)) {
      throw Error(`ScreenPrinter cannot print promises`)
    } else {
      this.logRecord(thing as any, kv)
    }
    return this
  }

  clearLine(kv: { markerId: string; text?: string }) {
    let txt = kv.text ?? ''
    // what will happen to next prints?
    //   - overlap this last line \r
    //   - print after this last line \n
    txt += '\n'
    this.log(txt, { rewrite: kv.markerId })
    return this
  }

  log(thing: (theme: ConsoleTheme) => any, kv?: LogOptions): MemoryScreenPrinter
  log(string, kv?: LogOptions): MemoryScreenPrinter
  log(): MemoryScreenPrinter
  log<T extends BaseScreenPrinter>(
    this: T,
    thing: unknown = '',
    kv: LogOptions = {},
  ): T {
    if (process.env.DEBUG === 'screen') {
      // TODO review
      delete kv.rewrite
    }
    let first = Array.isArray(thing) ? thing.filter(Boolean).join(' ') : thing
    let res = this.log2(first, kv)
    this.latest = { input: first, options: kv }
    return res
  }

  _pushLine(x) {}
  log_1(first = '', ...x) {
    // FROZEN (duplicated to log2)
    let start = indent(first, this.padding)
    let line = [start, ...x].join(' ')
    let newLines = line.split('\n')
    if (this.debugInline) {
      let loc = FindCaller.whenDevelopment()
      // let loc = myGetCaller()
      let label = shellHyperlink({
        text: 'screen',
        path: loc.path,
        lineNumber: loc.lineNumber,
        scheme: 'mscode',
      })
      newLines = newLines.map(line =>
        ConsoleTheme.devToolPrefixed(label, line, true),
      )
    }
    newLines.forEach(x => this._pushLine(x))

    if (this.debugLive) {
      let loc = FindCaller.whenDevelopment()
      // let loc = myGetCaller()
      let label = shellHyperlink({
        text: 'screen',
        path: loc.path,
        lineNumber: loc.lineNumber,
        scheme: 'mscode',
      })
      // eslint-disable-next-line
      console.log(ConsoleTheme.devToolPrefixed(label, line, true))
    }

    if (this.liveMode) {
      // eslint-disable-next-line
      console.log(line)
    }
    if (this.echo) {
      // eslint-disable-next-line
      console.log(line)
    }
    return this
  }

  write(txt) {
    process.stdout.write(txt)
  }

  // TODO review dedup with ObjectTable
  logRecord(rec: Record<string, unknown>, kv: LogOptions = {}) {
    let op_indent = kv.indent ?? 0
    // let txt = inspect(rec, { breakLength: 1 }).slice(2, -1)
    Object.entries(rec).forEach(([key, value]) => {
      let value_s: string
      if (typeof value === 'string') {
        value_s = sanitizeString(value)
        if (value_s.includes('\n')) {
          value_s = '\n' + value_s
          value_s = indent(value_s, 2 + op_indent)
        }
      } else {
        if (value == undefined) {
          // TODO missing test for #edge
          value_s = '-{undefined}-'
        } else {
          value_s = value.toString()
        }
      }

      let key_s = chalk.green(indent(key, op_indent))
      this.log(`${key_s}: ${value_s}`)
    })
    // txt = indent(txt, 2)
    return this
  }

  child() {
    let obj = new MemoryScreenPrinter()
    obj.debugLive = this.debugLive
    obj.liveMode = this.liveMode
    obj.padding = this.padding
    return obj
  }

  indent(x = 2) {
    let copy = this.child()
    copy.padding += x
    return copy
  }

  dedent(x = 2) {
    let copy = this.child()
    copy.padding -= x
    return copy
  }

  object(data: Record<string, unknown>) {
    let obj = new ObjectPrinter({ screen: this, data: data })
    return obj
  }

  logObject(data: Record<string, unknown>, kv: { extraPadding? } = {}) {
    this.object(data).print(kv)
    return this
  }

  map<T>(all: T[], cb: (x: T) => any) {
    all.forEach(x => {
      let res = cb(x)
      this.log(res)
    })
    return this
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} >`
  }
}

/** Stateful ScreenPrinter
 *
 * @deprecated Under review. Should this be a mock? or is there a reason for
 * users to pack and delay screen printing?
 */
export class MemoryScreenPrinter extends BaseScreenPrinter {
  _lines: string[] = []

  text(
    kv: {
      trim?: boolean
      /** @deprecated */
      color?
      /** @deprecated */
      ansiCodes?
      stripAnsi?
      clean?
      indent?: number
    } = {},
  ) {
    let output = this._lines.join('\n')
    if (kv.color === false) {
      output = decolorize(output)
    }
    if (kv.ansiCodes === false) {
      output = stripAnsiCodes(output)
    }
    if (kv.clean === true) {
      output = stripAnsiCodes(output)
    }
    if (kv.stripAnsi) {
      output = stripAnsiCodes(output)
    }
    if (kv.indent) {
      output = indent(output, kv.indent)
    }

    if (kv.trim) {
      output = output
        .split('\n')
        .map(x => x.trim())
        .join('\n')
    }
    return output
  }

  clear() {
    this._lines = []
    return this
  }

  hasText() {
    return this._lines.length > 0
  }

  lines(kv: { color?; stripAnsi? } = {}) {
    if (kv.color === false) {
      return this._lines.map(decolorize)
    }
    if (kv.stripAnsi) {
      return this._lines.map(stripAnsiCodes)
    }
    return this._lines
  }

  isEmpty() {
    return this.lines.length === 0
  }

  merge(other: MemoryScreenPrinter) {
    this._lines = [...this._lines, ...other._lines]
    other._lines.forEach(x =>
      this._printLive(
        x,
        // TODO bug?
        {},
      ),
    )
  }

  clone() {
    let obj = new MemoryScreenPrinter()
    obj.debugLive = this.debugLive
    obj.liveMode = this.liveMode
    return obj
  }

  _pushLine(x) {
    this._lines.push(x)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} lines=${this._lines.length}>`
  }
}
