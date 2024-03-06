import { LogServer } from '../LogServer.js'
import { NodeLogPrinter } from './NodeLogPrinter.js'

LogServer.request().printer = new NodeLogPrinter()
