import { LogServer } from './LogServer.js'
import { printLogEventInNode } from './_node/printLogEventInNode.js'

let server = LogServer.request()
server.printLog = printLogEventInNode()
