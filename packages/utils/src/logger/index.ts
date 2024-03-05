export { LogServer } from './LogServer.js'
export { Logger } from './Logger.js'

import { Logger } from './Logger.js'

export const $log = new Logger()
export const $dev = $log.dev.bind($log)

export function installGlobal() {
  global.$log = $log
  global.$dev = $dev
}
