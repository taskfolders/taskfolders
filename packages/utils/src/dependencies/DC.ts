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
    let klass: IDependencyKlass<any>
    // @ts-expect-error TODO
    let thing = kv.klass ?? kv.token
    let name: string
    let instance: T
    let type: ILifeTime
    let create: () => T

    if ('klass' in kv) {
      klass = kv.klass
      let mock = this._mocksStore.get(klass)
      if (mock) {
        create = mock.onCreate
      } else {
        create = () => new klass()
      }
    } else {
      // TODO #dry on TOKEN
      type = kv.token.type
      name = kv.token.name
      switch (type) {
        case 'transient': {
          let mock = this._mocksStore.get(kv.token)
          if (mock) {
            create = () => {
              let r1 = mock.onCreate()
              return r1
            }
          } else {
            create = () => kv.token.create()
          }
          instance = create()
          break
        }
        case 'singleton': {
          let found = this._tokensStore.get(kv.token)
          instance = found ?? kv.token.create()
          break
        }
        default:
          assertNever(type)
      }
      // type = token.type

      instance = create()
      return FetchRawResult.create({
        name,
        type,
        instance,
        dependencies: [],
        start: null,
      })
    }

    let meta = DependencyMeta.get(klass)
    if (!meta) {
      throw Error(`No meta for class ${klass.name}`)
    }
    type = meta.lifetime

    switch (type) {
      case 'singleton': {
        let found = this._klassStore.get(klass)
        if (!found) {
          // TODO:dry-create
          if ('create' in klass) {
            found = klass.create()
          } else {
            found = create()
          }
          this._klassStore.set(klass, found)
        }
        instance = found
        break
      }
      case 'transient': {
        // TODO:dry-create
        if ('create' in klass) {
          instance = klass.create()
        } else {
          //instance = new klass()
          instance = create()
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
      name: klass.name,
      type,
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
