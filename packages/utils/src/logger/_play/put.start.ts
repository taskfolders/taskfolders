import { Logger } from '../index.js'
let log = new Logger()
// log._debug = true ???

log.info('hi log')
// log.put('text with forced _debug')

let log2 = new Logger()
log2.put('').put('normal text')
