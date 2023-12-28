import { Logger } from '../Logger'

export function printMore(log: Logger) {
  log.warn('in more')
  log.__bug('fox more')
}
