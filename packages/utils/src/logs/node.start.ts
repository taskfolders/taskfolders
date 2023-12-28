import { LogServer } from './LogServer'
import { printLogEventInNode } from './_node/printLogEventInNode'

let server = LogServer.request()
server.printLog = printLogEventInNode
