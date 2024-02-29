import { $log, BrowserLogger } from '../index.js'

let log = new BrowserLogger()
log.warn('in browser')

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

main()
