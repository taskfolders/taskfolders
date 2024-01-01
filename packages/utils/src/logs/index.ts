export { Logger } from './Logger'

import { Logger } from './Logger'
export function installGlobal() {
  global.$log = new Logger()
  global.$dev = (...x) => console.log(...x)
}
