import { NodeLogger } from './_draft/next/NodeLogger.js'

export const log = new NodeLogger()

export const dc: {
  log: NodeLogger
} = { log: new NodeLogger() }
