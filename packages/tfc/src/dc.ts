import { NodeLogger } from './_draft/logger/NodeLogger.js'

export const log = new NodeLogger()
export const $dev = log.dev.bind(log)

export const dc: {
  log: NodeLogger
} = { log: new NodeLogger() }
