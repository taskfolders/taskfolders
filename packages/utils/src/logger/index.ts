export { LogServer } from './LogServer.js'
export { Logger } from './Logger.js'

import { Logger } from './Logger.js'
const $log = new Logger()
const $dev = $log.dev.bind($log)

export function installGlobal() {
  global.$log = $log
  global.$dev = $dev
}
