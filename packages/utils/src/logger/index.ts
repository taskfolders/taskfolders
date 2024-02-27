export { Logger } from './Logger'
import { Logger } from './Logger'

export const $log = new Logger()
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
