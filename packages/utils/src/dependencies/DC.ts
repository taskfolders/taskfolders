import { InjectMarker } from './InjectMarker'
import { ILifeTime, StartType, DependencyMeta } from './DependencyMeta'
import { assertNever } from '../types/assertNever'
import { FetchAsyncError } from './errors'

type Dependency<T> =
  | { create(): T; name?: string }
  | { new (...x): T; name: string; create?(): never }

type StartDSL<T> = { method: keyof T; type: StartType }
type StartInfo = StartDSL<unknown> & { running: Promise<unknown> }
interface DepOutput {
  name
  keyPath: string[]
  start: StartInfo
}

class FetchRawResult {
  name: string
  type: ILifeTime
  instance
  dependencies: DepOutput[]
  start: StartInfo

  static create(kv: {
    name: string
    type: ILifeTime
    instance
    dependencies: DepOutput[]
    start: StartInfo
  }) {
    let obj = new this()
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

export class DC {
  _content = new Map<any, any>()

  static inject<T>(klass: Dependency<T>): T {
    return InjectMarker.build({ klass }) as T
  }

  static decorate<T>(
    klass: { new (...x): T },
    kv: {
      lifetime?: ILifeTime
      start?: StartDSL<T>
    },
  ) {
    // $dev('deco!')
    let meta = DependencyMeta.getsert(klass)
    meta.lifetime = kv.lifetime ?? 'transient'
    meta.start = kv.start
    //
  }

  finish(
    target,
    kv: { dependencies?: DepOutput[]; keyPath?; meta?: DependencyMeta } = {},
  ) {
    let acu = kv.dependencies ?? []
    let keyPath = kv.keyPath ?? []
    Object.entries(target).forEach(([key, value]) => {
      if (InjectMarker.is(value)) {
        let res = this.fetchRaw({
          klass: value.klass,
          dependencies: acu,
          keyPath: [key],
        })
        let next: DepOutput = {
          name: res.name,
          keyPath: [...keyPath, key],
          start: res.start,
        }
        acu.push(next)

        target[key] = res.instance
      }
    })
    return acu
  }

  fetchRaw<T>(kv: {
    klass: Dependency<T>
    dependencies?: any[]
    keyPath?: any[]
  }): FetchRawResult {
    let meta = DependencyMeta.get(kv.klass)
    if (!meta) {
      throw Error(`No meta for class ${kv.klass.name}`)
    }
    let type = meta.lifetime

    let instance: T
    switch (type) {
      case 'singleton': {
        let found = this._content.get(kv.klass)
        if (!found) {
          // TODO:dry-create
          if ('create' in kv.klass) {
            found = kv.klass.create()
          } else {
            found = new kv.klass()
          }
          this._content.set(kv.klass, found)
        }
        instance = found
        break
      }
      case 'transient': {
        // TODO:dry-create
        if ('create' in kv.klass) {
          instance = kv.klass.create()
        } else {
          instance = new kv.klass()
        }
        break
      }
      default: {
        assertNever(type)
      }
    }
    // ..
    let dependencies = this.finish(instance, {
      dependencies: kv.dependencies,
      keyPath: kv.keyPath,
      meta,
    })

    // .. async creation steps
    let start
    if (meta.start) {
      let running = instance[meta.start.method]()
      start = { ...meta.start, running }
    }

    // ..

    return FetchRawResult.create({
      name: kv.klass.name,
      type,
      instance,
      dependencies,
      start,
    })
  }

  fetch<T>(klass: Dependency<T>): T {
    let res = this.fetchRaw({ klass })
    let all = res.allRunning({ type: 'await' })
    if (all.length > 0) {
      throw new FetchAsyncError()
    }
    return res.instance
  }

  async fetchAsync<T>(klass: Dependency<T>): Promise<T> {
    let res = this.fetchRaw({ klass })

    await Promise.all(res.allRunning({ type: 'await' }))

    //$dev({ allRun })
    return res.instance
  }
}
