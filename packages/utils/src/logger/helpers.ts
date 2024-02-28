import { isNodeRuntime } from '../runtime/isNodeRuntime.js'

export type LogLevelName = 'trace' | 'debug' | 'info' | 'dev' | 'warn' | 'error'
export const levelNumbers: Record<LogLevelName, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  dev: 4,
  warn: 5,
  error: 6,
}

function isValidLevelName(envLevel: string): envLevel is LogLevelName {
  if (!envLevel) return false
  let number = levelNumbers[envLevel]
  if (number === undefined) {
    return false
  }
  return true
}

export function defaultLogLevel(): LogLevelName {
  // if (typeof process.env.LOG_LEVEL !== 'undefined') {
  let env = process.env.LOG_LEVEL
  if (env) {
    if (isValidLevelName(env)) {
      return env
    }
  }
  // }

  if (!isNodeRuntime()) {
    return 'error'
  }

  // if (typeof process.env.LOG_LEVEL === 'undefined') {
  //   return 'warn'
  // }

  let envNode = process.env.NODE_ENV
  if (envNode === 'production') {
    return 'warn'
  } else if (envNode === 'test') {
    return 'error'
  } else {
    return 'info'
  }
}
function emitWarning(msg: string) {
  if (typeof process === 'object') {
    process.emitWarning(msg)
  } else {
    console.warn(msg)
  }
}

export function envLogLevel() {
  let envLevel
  if (isNodeRuntime()) {
    envLevel = process.env.LOG_LEVEL
  }

  if (envLevel) {
    if (!isValidLevelName(envLevel)) {
      emitWarning(`Invalid environment level name :${envLevel}`)
      return defaultLogLevel()
    } else {
      return envLevel
    }
  }
  return defaultLogLevel()
}
