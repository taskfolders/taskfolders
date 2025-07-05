import { NodeLogger } from './_draft/next/Logger.js'

export const log = new NodeLogger()

export const dc: {
  log: NodeLogger
} = { log: new NodeLogger() }
