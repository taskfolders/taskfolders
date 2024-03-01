import { InjectMarker } from './InjectMarker.js'
import {
  ILifeTime,
  StartType,
  DependencyMeta,
  StartDSL,
} from './DependencyMeta.js'
import { assertNever } from '../types/assertNever.js'
import { FetchAsyncError, UnregisteredValueError } from './errors.js'
import { FetchRawResult } from './FetchRawResult.js'
import { DependencyToken } from './DependencyToken.js'

type IDependencyKlass<T> = { new (...x): T; name: string; create?(): never }
type IDependencyToken<T> = { create(): T; name?: string }
type IDependency<T> = IDependencyToken<T> | IDependencyKlass<T>

export const getAllValuesUp = (dc: DC, key: keyof DC, acu = []) => {
  if (!dc) return
  let value = dc[key]
  acu = [...acu, value]

  if (!dc._parent) return acu
  return getAllValuesUp(dc._parent, key, acu)
}

export type StartInfo = StartDSL<any> & { running: Promise<unknown> }
export interface DepOutput {
  name
  keyPath: string[]
  start: StartInfo
}

export class DC {
  _instanceStore = new Map<unknown, any>()
  _mocksStore = new Map<unknown, { onCreate() }>()

  name: string
  _parent: DC

  constructor(kv: { name?: string; parent?: DC } = {}) {
    this.name = kv.name ?? crypto.randomUUID()
    if (kv.parent !== null) {
      this._parent = Container
    }
  }

  static inject<T>(klass: IDependency<T>): T {
    return InjectMarker.build({ klass }) as T
  }

  static decorate<T>(
    klass: { new (...x): T },
    kv: {
      lifetime?: ILifeTime
      start?: StartDSL<T>
      mockFor?
      destroy?: boolean
    } = {},
  ) {
    // $dev('deco!')
    let meta = DependencyMeta.getsert(klass)
    meta.lifetime = kv.lifetime ?? 'transient'
    meta.start = kv.start
    meta.mockFor = kv.mockFor
    if (kv.destroy) {
      if (meta.lifetime !== 'singleton') {
        throw Error('Destroy method only for singletons')
      }
      meta.destroy = true
    }
    //
  }

  static get global() {
    return Container
  }

  _findUp(kv: { instance } | { mock }) {
    if ('instance' in kv) {
      let obj = kv.instance
      let found = this._instanceStore.get(obj)
      if (found) return found
    } else if ('mock' in kv) {
      let obj = kv.mock
      let found = this._mocksStore.get(obj)
      if (found) return found
    }
    if (this._parent) return this._parent._findUp(kv)
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
      if (!meta) {
        // class with no DC config
        meta = new DependencyMeta()
      }

      name = klass.name
      if (!create) {
        switch (meta.lifetime) {
          case 'singleton': {
            let found = this._findUp({ instance: klass })
            if (!found) {
              found = new klass()
              this._instanceStore.set(klass, found)
            }
            create = () => found
            break
          }
          case 'transient': {
            create = () => new klass()
            break
          }
          case 'value': {
            let found = this._findUp({ instance: klass })
            if (!found) {
              throw new UnregisteredValueError()
            }
            create = () => found
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
            let found = this._findUp({ instance: kv.token })
            if (!found) {
              found = kv.token.create()
              this._instanceStore.set(kv.token, found)
            }
            create = () => found
            break
          }
          case 'value': {
            let found = this._findUp({ instance: kv.token })
            if (!found) {
              throw new UnregisteredValueError()
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

  mock(thing: any, kv?: { onCreate() }) {
    let target = thing as any
    if (!kv) {
      target = thing.constructor
      kv = { onCreate: () => thing }
    }
    let meta = DependencyMeta.get(target)
    let mockFor = meta?.mockFor
    if (mockFor) {
      target = mockFor
    }
    this._mocksStore.set(target, { onCreate: kv.onCreate })
  }

  fetch<T>(thing: IDependency<T>): T {
    let res
    console.log('..y')

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

  register<T>(
    thing: DependencyToken<T> | IDependencyKlass<T>,
    kv: { value: T },
  ) {
    this._instanceStore.set(thing, kv.value)
  }

  async destroy() {
    for (let obj of this._instanceStore.values()) {
      // TODO review weakness/bug
      //   what if instance from token??? this only works for class
      let meta = DependencyMeta.get(obj.constructor)
      if (meta?.destroy) {
        await obj['destroy']()
      }
    }
  }

  fork(kv: { name?: string } = {}) {
    let next = new DC({ name: kv.name })
    next._parent = this
    return next
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let names = getAllValuesUp(this, 'name').reverse().join(':')
    let parts = [names].join()
    return `<${this.constructor.name} ${parts}>`
  }
}

export const Container = new DC({ name: 'global', parent: null })
