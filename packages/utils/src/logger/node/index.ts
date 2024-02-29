export { NodeLogger } from './NodeLogger.js'
import { NodeLogger } from './NodeLogger.js'

export const $log = new NodeLogger()
export const $dev = $log.dev.bind($log)

export function installGlobal() {
  global.$log = $log
  global.$dev = $dev
}

globalThis._TF_CONSOLE_LOG_HOOK = true

export function installOnConsoleLog() {
  if (globalThis._TF_CONSOLE_LOG_HOOK === true) return
  const original = console.log

  function logHook(...x) {
    //original('--', ...x)
    $log.info(...x)
  }

  console.log = logHook
}
