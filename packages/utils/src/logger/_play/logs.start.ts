import '../node.start'
import { Logger } from '../Logger'
import { printMore } from './helper'
let log = new Logger()

function main() {
  log.trace('hi log')
  log.debug('hi log')
  log.info('hi log')
  log.dev('hi log')
  log.dev('forcing link', null, { forceLink: true })
  log.warn('hi log')
  log.error('hi log')
  // printMore(log)
}

main()
