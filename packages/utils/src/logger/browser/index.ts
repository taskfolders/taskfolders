import { BrowserLogger } from './BrowserLogger.js'

export const $log = new BrowserLogger()
export const $dev = $log.dev.bind($log)

export function installGlobal() {
  global.$log = $log
  global.$dev = $dev
}
