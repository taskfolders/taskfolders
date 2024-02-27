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

globalThis._TF_CONSOLE_LOG_HOOK = true

function installOnConsoleLog() {
  if (globalThis._TF_CONSOLE_LOG_HOOK === true) return
  const original = console.log

  function logHook(...x) {
    original('--', ...x)
  }

  console.log = logHook
}
