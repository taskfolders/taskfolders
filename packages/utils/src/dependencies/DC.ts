import { InjectMarker } from './InjectMarker'
import { ILifeTime, StartType, DependencyMeta } from './DependencyMeta'
import { assertNever } from '../types/assertNever'
import { FetchAsyncError } from './errors'
import { FetchRawResult } from './FetchRawResult'
import { DependencyToken } from './DependencyToken'
import { randomId } from '../ids/randomId'

type IDependencyKlass<T> = { new (...x): T; name: string; create?(): never }
type IDependencyToken<T> = { create(): T; name?: string }
type IDependency<T> = IDependencyToken<T> | IDependencyKlass<T>

type StartDSL<T> = { method: keyof T; type: StartType }
export type StartInfo = StartDSL<unknown> & { running: Promise<unknown> }
export interface DepOutput {
  name
  keyPath: string[]
  start: StartInfo
}

export class DC {
  _klassStore = new Map<{ new (...x) }, any>()
  _tokensStore = new Map<DependencyToken<any>, any>()
  _mocksStore = new Map<any, { onCreate }>()

  name: string

  constructor(kv: { name?: string } = {}) {
    this.name = kv.name ?? randomId()
  }

  static inject<T>(klass: IDependency<T>): T {
    return InjectMarker.build({ klass }) as T
  }

  static decorate<T>(
    klass: { new (...x): T },
    kv: {
      lifetime?: ILifeTime
      start?: StartDSL<T>
    } = {},
  ) {
    // $dev('deco!')
    let meta = DependencyMeta.getsert(klass)
    meta.lifetime = kv.lifetime ?? 'transient'
    meta.start = kv.start
    //
  }

  static get global() {
    return Container
  }

  static ensure(dc: DC) {
    return dc ?? this.global
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

  fetchRaw<T>(
    kv: (
      | {
          klass: IDependencyKlass<T>
        }
      | {
          token: DependencyToken<T>
        }
    ) & {
      dependencies?: any[]
      keyPath?: any[]
    },
  ): FetchRawResult<T> {
    // @ts-expect-error TODO
    let thing = kv.klass ?? kv.token
    let name: string
    let instance: T
    let create: () => T
    let meta: DependencyMeta

    let mock = this._mocksStore.get(thing)
    if (mock) {
      create = () => mock.onCreate()
    }

    if ('klass' in kv) {
      let klass: IDependencyKlass<any>
      klass = kv.klass

      meta = DependencyMeta.get(klass)
      name = klass.name
      if (!create) {
        switch (meta.lifetime) {
          case 'singleton': {
            let found = this._klassStore.get(klass)
            if (!found) {
              found = new klass()
              this._klassStore.set(klass, found)
            }
            create = () => found
            break
          }
          case 'transient': {
            create = () => new klass()
            break
          }
          default: {
            assertNever(meta.lifetime)
          }
        }
      }
    } else {
      // TODO #dry on TOKEN
      name = kv.token.name
      meta = kv.token.meta
      if (!create) {
        switch (meta.lifetime) {
          case 'transient': {
            create = () => kv.token.create()
            break
          }
          case 'singleton': {
            let found = this._tokensStore.get(kv.token)
            if (!found) {
              found = kv.token.create()
              this._tokensStore.set(kv.token, found)
            }
            create = () => found
            break
          }
          default:
            assertNever(meta.lifetime)
        }
      }
    }

    if (!meta) {
      throw Error(`No meta for class ${name}`)
    }

    instance = create()

    // ..
    let dependencies = this.finish(instance, {
      dependencies: kv.dependencies,
      keyPath: kv.keyPath,
      meta,
    })

    // .. async creation steps
    let start: StartInfo
    if (meta.start) {
      let running = instance[meta.start.method]()
      start = { ...meta.start, running }
    }

    return FetchRawResult.create({
      name,
      type: meta.lifetime,
      instance,
      dependencies,
      start,
    })
  }

  mockRaw<T>(kv: {
    klass?: IDependencyKlass<T>
    token?: IDependencyToken<T>
    onCreate?(): T
  }) {
    this._mocksStore.set(kv.klass ?? kv.token, { onCreate: kv.onCreate })
  }

  mock(thing: IDependency<any>, kv: { onCreate() }) {
    this._mocksStore.set(thing, { onCreate: kv.onCreate })
  }

  fetch<T>(thing: IDependency<T>): T {
    let res
    if (DependencyToken.is(thing)) {
      res = this.fetchRaw({
        token: thing,
      })
    } else {
      res = this.fetchRaw({
        klass: thing as IDependencyKlass<any>,
      })
    }
    let all = res.allRunning({ type: 'await' })
    if (all.length > 0) {
      throw new FetchAsyncError()
    }
    return res.instance
  }

  async fetchAsync<T>(klass: IDependencyKlass<T>): Promise<T> {
    let res = this.fetchRaw({ klass })

    await Promise.all(res.allRunning({ type: 'await' }))

    //$dev({ allRun })
    return res.instance
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let parts = [this.name].join(' ')
    return `<${this.constructor.name} ${parts}>`
  }
}

export const Container = new DC({ name: 'global' })
