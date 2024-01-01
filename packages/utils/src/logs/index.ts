export { Logger } from './Logger'

import { Logger } from './Logger'
export function installGlobal() {
  let log = new Logger()
  global.$log = log
  global.$dev = (...x) =>
    log.dev(
      // @ts-expect-error TODO
      ...x,
    )
}
