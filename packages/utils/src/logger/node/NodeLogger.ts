import { BaseLogger } from '../BaseLogger.js'
import { NodeLogServer } from './NodeLogServer.js'

export class NodeLogger extends BaseLogger {
  server = NodeLogServer.request()
}
