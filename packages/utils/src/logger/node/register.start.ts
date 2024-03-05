import { LogServer } from '../LogServer.js'
import { NodeLogPrinter } from './printLogEventInNode.js'

LogServer.request().printer = new NodeLogPrinter()
