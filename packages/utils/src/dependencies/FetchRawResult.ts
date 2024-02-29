import { ILifeTime, StartType } from './DependencyMeta.js'
import type { DepOutput, StartInfo } from './DC.js'

export class FetchRawResult<T> {
  name: string
  type: ILifeTime
  instance: T
  dependencies: DepOutput[]
  start: StartInfo

  static create<T>(kv: {
    name: string
    type: ILifeTime
    instance: T
    dependencies: DepOutput[]
    start: StartInfo
  }): FetchRawResult<T> {
    let obj = new this<T>()
    Object.assign(obj, kv)
    return obj
  }

  allRunning(kv: { type?: StartType } = {}) {
    let allStart = this.dependencies
      .map(x => x.start)
      .concat(this.start)
      .filter(Boolean)

    let allRun = allStart
      .filter(x => {
        if (kv.type) return x.type === kv.type
        return true
      })
      .map(x => {
        return x.running
      })

    return allRun
  }

  async started() {
    await Promise.allSettled(this.allRunning())
  }
}
