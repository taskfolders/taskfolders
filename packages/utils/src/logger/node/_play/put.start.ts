import { NodeLogger } from '../index.js'
let log = new NodeLogger()
log._debug = true

log.info('hi log')
log.put('normal text')
