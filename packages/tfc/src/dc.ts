import { NodeLogger } from './_draft/logger/NodeLogger.js'

export const log = new NodeLogger()

export const dc: {
  log: NodeLogger
} = { log: new NodeLogger() }
