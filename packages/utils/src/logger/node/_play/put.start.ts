import { NodeLogger } from '../index.js'
let log = new NodeLogger()
log._debug = true

log.info('hi log')
// log.put('text with forced _debug')

let log2 = new NodeLogger()
log2.put('').put('normal text')
