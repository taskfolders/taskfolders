import { NodeLogger } from './NodeLogger.js'

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
