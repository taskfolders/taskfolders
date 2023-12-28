import '../node.start'
import { Logger } from '../Logger'
let sut = new Logger()

sut.trace('hi log')
sut.debug('hi log')
sut.info('hi log')
sut.dev('hi log')
sut.warn('hi log')
sut.error('hi log')
