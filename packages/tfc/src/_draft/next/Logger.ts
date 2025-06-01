import { inspect } from 'util'

export class Logger {
  options = {
    deep: false,
  }

  info(...args) {
    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        args = [inspect(args[0], { depth: null, colors: true })]
      }
    } else if (args.length === 2) {
      if (typeof args[1] === 'object') {
        args = [args[0], inspect(args[1], { depth: null, colors: true })]
      }
    }
    console.log('[INFO]', ...args)
  }
  deep() {
    let next = new Logger()
    return next
  }
  child() {
    // return one shot parametrize logger
    return this
  }
}
