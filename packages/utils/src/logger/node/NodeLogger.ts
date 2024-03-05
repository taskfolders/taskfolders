import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { FindCaller } from '../../stack/locate/FindCaller.js'
import { getCallerFile } from '../../stack/locate/getCallerFile.js'
import { BaseLogServer } from '../BaseLogServer.js'
import { BaseLogger, LogEvent } from '../BaseLogger.js'
import { NodeLogServer } from './NodeLogServer.js'
import { isDebug } from '../../runtime/isDebug.js'
//import { magenta } from 'chalk'
import chalk from 'chalk'
import { passThreshold } from '../passThreshold.js'
import { hasShellLinks } from './printLogEventInNode.js'

export class NodeLogger extends BaseLogger {
  _debug: boolean
  server: BaseLogServer

  constructor(kv: { server?: BaseLogServer } = {}) {
    super()
    this.server = kv.server ?? NodeLogServer.request()
  }

  _logRaw(kv: LogEvent) {
    let log = { ...kv, loggerName: this.name, options: kv.args.at(2) ?? {} }

    // if (log.options.forceLink) {
    //   log.location = getCallerFile()
    // } else {
    //   if (hasShellLinks('log')) {
    //     if (passThreshold({ level: log.levelName, threshold: 'info' })) {
    //       log.location = getCallerFile({ offset: 1 })
    //     }
    //   }
    // }

    this.server.handleLog(log)
  }

  screen = {
    debug: false,
    print(text: string) {
      //
    },
  }

  put(text: string) {
    let parts = [text]
    this.screen.print(text)

    let hasDebug = this._debug ?? isDebug('put') ?? isDebug('screen')
    if (hasDebug) {
      let pos = getCallerFile()
      let label = shellHyperlink({
        text: 'screen',
        path: pos.path,
        lineNumber: pos.lineNumber,
        scheme: 'mscode',
      })
      label = chalk.magenta(label)
      parts = [label, ...parts]
    }

    if (hasDebug || process.env.NODE_ENV !== 'test') {
      console.log(parts.join(' '))
    }

    return this
  }
}
