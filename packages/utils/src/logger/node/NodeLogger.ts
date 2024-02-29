import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { FindCaller } from '../../stack/locate/FindCaller.js'
import { getCallerFile } from '../../stack/locate/getCallerFile.js'
import { BaseLogger } from '../BaseLogger.js'
import { NodeLogServer } from './NodeLogServer.js'
//import { magenta } from 'chalk'
import chalk from 'chalk'

export class NodeLogger extends BaseLogger {
  server = NodeLogServer.request()

  put(txt: string) {
    let parts = [txt]
    if (this._debug) {
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
    console.log(parts.join(' '))
  }
}
