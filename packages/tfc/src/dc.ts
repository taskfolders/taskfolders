import { Logger } from './_draft/next/Logger.js'

export const log = new Logger()

export const dc: {
  log: Logger
} = { log: new Logger() }
