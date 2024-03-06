// TODO review needed? just use setupLogger?

import { Logger as NodeLogger } from '../Logger.js'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'
import * as chalk from 'chalk'

export class LoggerMock extends NodeLogger {
  acu: string[] = []
  _debug: boolean

  static hook<T, P extends keyof T>(
    obj: T,
    key: P & T[P] extends NodeLogger ? P : never,
    kv: { debug?: boolean } = {},
  ) {
    let mock = new this()
    mock._debug = kv.debug

    // @ts-expect-error TODO
    obj[key] = mock
    return mock
  }

  /** @deprecated just use mock? */
  static spy(log: NodeLogger) {
    let obj = new this()

    let original = log.put.bind(log)
    log.put = x => {
      obj.acu.push(x)
      if (obj._debug) {
        console.log(chalk.magenta('screen'), '|', x)
      }
      return original(x)
    }

    return obj
  }

  text(kv: { stripAnsi?: boolean } = {}) {
    let txt = this.acu.join('\n')
    if (kv.stripAnsi) {
      txt = stripAnsiCodes(txt)
    }
    return txt
  }

  put(text: string) {
    this.acu.push(text)
    return super.put(text)
  }

  /** expect logs (like errors) */
  expect(rx: RegExp, kv: { level? } = {}) {
    throw Error('todo')
  }
}
