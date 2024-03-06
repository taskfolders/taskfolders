import { indent } from '../native/string/indent.js'
import { stripAnsiCodes } from '../native/string/stripAnsiCodes.js'
import { ScreenPrinter, decolorize } from './ScreenPrinter.js'

/** Stateful ScreenPrinter
 *
 * @deprecated Under review. Should this be a mock? or is there a reason for
 * users to pack and delay screen printing?
 */

export class MemoryScreenPrinter extends ScreenPrinter {
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
