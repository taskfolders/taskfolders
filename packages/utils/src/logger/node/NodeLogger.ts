import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { FindCaller } from '../../runtime/stack/locate/FindCaller.js'
import { getCallerFile_v1 } from '../../runtime/stack/locate/getCallerFile.js'
import { LogServer } from '../LogServer.js'
import { Logger, LogEvent } from '../Logger.js'
import { isDebug } from '../../runtime/isDebug.js'
//import { magenta } from 'chalk'
import chalk from 'chalk'
import { passThreshold } from '../passThreshold.js'
import { hasShellLinks } from './NodeLogPrinter.js'

class NodeLogger_DROP extends Logger {
  _debug: boolean
  server: LogServer

  constructor(kv: { server?: LogServer } = {}) {
    super()
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

  // screen = {
  //   debug: false,
  //   print(text: string) {
  //     //
  //   },
  // }

  put_NODE(text: string) {
    let parts = [text]
    //this.screen.print(text)

    let hasDebug = this._debug ?? isDebug('put') ?? isDebug('screen')
    if (hasDebug) {
      let pos = getCallerFile_v1()
      let label = shellHyperlink({
        text: 'screen',
        path: pos.path,
        lineNumber: pos.lineNumber,
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
