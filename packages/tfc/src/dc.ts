import { _ } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js'
import { NodeLogger } from './_draft/logger/NodeLogger.js'

export const log = new NodeLogger()
export const $dev = log.dev.bind(log)

export class DependencyContainer {
  // private dependencies: Record<string, any> = {}

  // register(name: string, dependency: any) {
  //   this.dependencies[name] = dependency
  // }

  // get(name: string) {
  //   return this.dependencies[name]
  // }

  log = new NodeLogger()

  _now: Date
  now() {
    if (!this._now) {
      this._now = new Date()
    }
    return this._now
  }
}

export const dc = new DependencyContainer()
