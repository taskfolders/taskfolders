import { $log, NodeLogger } from '../index.js'
let log = new NodeLogger()
log.warn('wow')

function main() {
  $log.trace('hi log')
  $log.debug('hi log')
  $log.info('hi log')
  $log.dev('hi log')
  $log.dev('forcing link', null, { forceLink: true })
  $log.warn('hi log')
  $log.error('hi log')
  // printMore(log)
}

// main()
