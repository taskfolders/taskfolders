// import { CustomError } from '../errors/CustomError'
// import { isPromise } from '../native/promise/isPromise'
// import { GlobalRegistry } from './_legacy/GlobalRegistry'
// import { assertNever, ExcludeOptionalProps } from '../types/index'
// import { nodeEnv } from '../runtime/isNodeEnv'
// import { getsertValue } from '../native/object/getsertValue'
const isPromise = x => false
class CustomError {
  static create(msg, kv) {
    return Error(msg)
  }
}

import { getsert } from '../native/object/getsert.js'
import { ExcludeOptionalProps } from '../types/ExcludeOptionalProps.js'
import { assertNever } from '../types/assertNever.js'
import { InjectMarker } from './InjectMarker.js'

export const SYM_DependencyConfig = Symbol(
  'taskfolders.com:dependency.class-config',
)
export const SYM_CONTAINER = Symbol('taskfolders.com:dependency-container')
const SYM_CLASS_START = Symbol('taskfolders.com:dependency.class-start')
const SYM_STARTED = Symbol('taskfolders.com:dependency.started')

type startType = 'background' | 'await'
type StartConfig = { method: string; startType: startType }
type StopConfig = { method: string }

type MaybeArray<T> = T | T[]

export class DependencyError extends Error {
  constructor(m: string) {
    super(m)

    // TODO #review
    // https://github.com/microsoft/TypeScript-wiki/blob/81fe7b91664de43c02ea209492ec1cea7f3661d0/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    //
    // Set the prototype explicitly.
    // Object.setPrototypeOf(this, DependencyError.prototype)

    this.name = 'DependencyError'
  }
}

type MyParams<T extends { new (...x) }> =
  ConstructorParameters<T>[0] extends DependencyContainer
    ? ConstructorParameters<T>[1]
    : ConstructorParameters<T>[0]

interface SomeClass<T = unknown> {
  name?: string
  new (...x): T
}

type EmptyObject = {
  [K in any]: never
}

function findContainer(dc: DependencyContainer, kv: { type } | { name }) {
  if (!dc) return null
  if ('type' in kv) {
    if (dc.type === kv.type) {
      return dc
    }
  } else {
    if (dc.containerName === kv.name) {
      return dc
    }
  }
  return findContainer(dc._parent, kv)
}

let allContainers = (dc: DependencyContainer): DependencyContainer[] => {
  if (!dc) return []
  return allContainers(dc._parent).concat(dc)
}

export function getDependencyMarkers(obj) {
  return Object.entries(obj)
    .map(([key, thing]) => {
      if (InjectMarker.is(thing)) {
        return { key, marker: thing }
      }
    })
    .filter(Boolean)
}

function getKlassConfig(klass) {}

type ILifeTime =
  | 'value'
  | 'singleton'
  | 'scope'
  | 'transient'
  | 'global'
  | 'auth'

type ICreate = (container: DependencyContainer, buildParams?) => any

const SYM = Symbol('taskfolders.com:DependencyToken')

export interface DefDSL<T, TPar = unknown> {
  name?: string
  lifetime?: ILifeTime
  create?: (dc: DependencyContainer, par?: TPar) => T | Promise<T>
  presetValue?: boolean
}

export class DependencyToken<T, TParams = unknown> {
  // __sym = SYM
  name?: string
  _dsl: DefDSL<T>
  _id = SYM
  create: (dc?, x?: TParams) => T | Promise<T>

  static is(thing): thing is DependencyToken<any> {
    return thing._id === SYM
  }

  static define<K, TPar = unknown>(
    kv: DefDSL<K, TPar> = {},
  ): DependencyToken<K, TPar> {
    return {
      name: kv.name,
      // __sym: SYM,
      _id: SYM,
      _dsl: kv,
      create: kv.create,
    }
  }
}

export class DependencyMeta {
  lifetime: ILifeTime
  value? // ?: SomeClass
  // create?(container: DependencyContainer)
  create?: ICreate
  stop?: StopConfig
  start?: StartConfig
  mockingClass?
  // tags?: string[]

  passContainer?: boolean

  static get(thing): DependencyMeta {
    return thing[SYM_DependencyConfig]
  }
  static getsert(thing): DependencyMeta {
    thing[SYM_DependencyConfig] ??= {}
    return thing[SYM_DependencyConfig]
  }
}

interface DependencyClassConfig<TKlass = unknown, Tk = keyof TKlass> {
  lifetime: ILifeTime
  isValue?: boolean
  create?: ICreate
  tags?: string[]
  passContainer?
  mockingClass?: { new (...x) } | true

  // start at beginning app
  /** @deprecated */
  start?

  // builder?: keyof T
  /** @deprecated */
  builder_1?: Tk
  // build?(container: DependencyContainer): Promise<T> | T

  /** @deprecated */
  build?(this: TKlass, container: DependencyContainer): any

  // start?: keyof T
  /** @deprecated use @DC.start decorator */
  createAsync?: (x) => Promise<unknown>
}

type DepKlass<T, TParams> = {
  new (container: DependencyContainer, x?: TParams): T
}

interface IStarter {
  type: startType
  execute: () => any
}

interface FetchResult<T> {
  value: T
  config?: DependencyClassConfig<T>
  meta?: DependencyMeta
  starts?: Promise<void>[]
  starter?: IStarter
}

interface TMPInject {
  target
  create?
  starter?: IStarter
}

interface MyDSL<T> {
  create(): T
}
interface HijackDSL<T> {
  klass: {
    new (...x): T
  }
  mock?(dsl: MyDSL<T>): T
  // create?(): T
}

export class DependencyContainer {
  type: 'root' | 'scope' | 'global' = null
  containerName: string
  _parent: DependencyContainer
  _content = new Map<any, DependencyMeta>()
  _contentByLabel = {}
  _hijack = new Map<any, () => any>()
  _hijack_2 = new Map<{ new (...x): any }, HijackDSL<any>>()

  _contentByName = new Map<any, Record<any, { value: unknown }>>()

  static deco = {
    /** #decorator */
    createAsync() {
      return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
      ) {}
    },
  }

  static get global(): DependencyContainer {
    return getsert(global, '__tf_dc' as any, () => {
      let obj = new DependencyContainer()
      obj.type = 'global'
      return obj
    })
  }

  static ensure(x): DependencyContainer {
    if (x instanceof DependencyContainer) {
      return x
    }
    throw Error('Not a DependencyContainer')
  }

  static container(thing): DependencyContainer {
    return thing[SYM_CONTAINER]
  }
  static setContainer(thing, container: DependencyContainer) {
    thing[SYM_CONTAINER] = container
  }
  static async ensureDependencies(kv: {
    container: DependencyContainer
    target: unknown
    create?: boolean
  }) {
    let dependencies = getDependencyMarkers(kv.target)
    if (dependencies.length === 0) return kv.target

    if (!kv.container) {
      throw Error('Container needed')
    }

    await kv.container.applyInjectsAsync_INTERNAL({
      target: kv.target,
      create: kv.create,
    })
    return kv.target
  }

  static injectable_dirty(...x): any {
    // @ts-expect-error TODO
    return this.injectable(...x)
  }

  static injectable_2<T>(
    thing: ILifeTime,
    thing_2?: Partial<DependencyClassConfig<T>>,
  ) {
    // @ ts-expect-error TODO
    return this.injectable(thing, thing_2)
  }

  // #decorator
  static start(type: startType) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      let klass = target.constructor
      klass[SYM_CLASS_START] = {
        method: propertyKey,
        startType: type,
      } as StartConfig
      // $dev({ target, propertyKey, descriptor, see, klass })
      // $dev('second(): called')

      let config = DependencyMeta.getsert(target.constructor)
      config.start = {
        method: propertyKey,
        startType: type,
      }
    }
  }

  static mark: {
    start: typeof DependencyContainer.start
    stop: typeof DependencyContainer.stop
  }

  static stop() {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      let config = DependencyMeta.getsert(target.constructor)
      config.stop = { method: propertyKey } as StopConfig
      // // $dev({ target, propertyKey, descriptor, see, klass })
      // $dev('second(): called')
    }
  }

  /** @deprecated use .injectable */
  static define<T>(
    // thing: DependencyClassConfig<InstanceType<T>> | ILifeTime,
    thing: DependencyClassConfig<T> | ILifeTime | 'auth',
    thing_2?: Partial<DependencyClassConfig<T>>,
  ) {
    return this.injectable(thing, thing_2)
  }

  // #decorator
  // static injectable<T extends { new (x?: DependencyContainer, ...rest): any }>(
  // static injectable<T extends { new (x?): InstanceType<T> }>(
  static injectable<T>(
    // thing: DependencyClassConfig<InstanceType<T>> | ILifeTime,
    thing: Partial<DependencyClassConfig<T>> | ILifeTime | 'auth',
    thing_2?: Partial<DependencyClassConfig<T>>,
  ) {
    let dsl: DependencyClassConfig<T>
    if (typeof thing === 'string') {
      let lifetime = thing === 'auth' ? 'scope' : thing
      dsl = { lifetime }
    } else {
      dsl = { lifetime: 'transient', ...thing }
    }
    if (thing_2) {
      dsl = { ...dsl, ...thing_2 }
    }

    // return (constructor: { new (x?: DependencyContainer, ...rest): T }) =>

    return (targetKlass: T) => {
      if (dsl.mockingClass === true) {
        dsl.mockingClass = Object.getPrototypeOf(targetKlass)
      }

      // this.config(constructor, dsl)
      if (dsl.createAsync) {
        // dsl.create = async function createAsync() {
        //   let obj = new constructor()
        //   await obj[dsl.start]()
        //   return obj
        // }
      } else if (typeof dsl.create === 'string') {
        throw Error('todo')
        // dsl.create = async function createMethod() {
        //   let obj = new constructor()
        //   await obj[dsl.create]
        //   return obj
        // }
      }

      if (!dsl.create) {
        let that = this
        // TODO:dry-create #dirty risk of #dry
        dsl.create = function defaultCreate(container, buildParams?) {
          if (dsl.builder_1) {
            // @ts-expect-error TODO
            return targetKlass[dsl.builder_1](container)
          } else if (dsl.build) {
            return dsl.build.call(targetKlass, container)
          }

          let obj = container._create({
            // @ts-expect-error TODO
            klass: targetKlass,
            constructorParams: buildParams,
            _passContainerToConstructor: true,
          })

          return obj
        }
      }
      // if (dsl.lifetime === 'singleton') {
      // }
      let before = targetKlass[SYM_DependencyConfig] ?? {}
      targetKlass[SYM_DependencyConfig] = {
        name:
          // @ts-expect-error TODO
          targetKlass.name,
        ...before,
        ...dsl,
      }
      // Object.seal(constructor);
      // Object.seal(constructor.prototype);
    }
  }

  // TODO recover?
  // static request() {
  //   return GlobalRegistry.request().getsert(
  //     Symbol('DependencyContainer'),
  //     () => new DependencyContainer(),
  //   )
  // }

  static inject_2<T extends { new (x, y?): any }>(
    klass: T,
    kv: { passContainer? } = {},
  ): InstanceType<T> {
    let obj = InjectMarker.build({
      klass,
      passContainer: kv.passContainer ?? false,
    })
    return obj as any
  }

  static inject_1<
    T extends { new (x, y?): any },
    TOps = ConstructorParameters<T>[1],
  >(
    klass: T,
    ...ops: ExcludeOptionalProps<TOps> extends Record<string, never>
      ? [TOps?]
      : [TOps]
  ): InstanceType<T> {
    let obj = InjectMarker.build({ klass, ops: ops[0] })
    return obj as any
  }

  static inject<T extends { new (x, y?): any }>(klass: T): InstanceType<T> {
    let obj = InjectMarker.build({ klass })
    return obj as any
  }

  static inject_3<T>(klass: DependencyToken<T>): T {
    let obj = InjectMarker.build({ klass })
    return obj as any
  }

  static injectValue<T extends { new (x, y?): any }>(
    klass: T,
  ): // ...ops: [TOps?]
  InstanceType<T> {
    let obj = InjectMarker.build({ klass })
    return obj as any
  }

  static create() {
    return new this()
  }

  constructor(kv: { name?: string; parent?: DependencyContainer } = {}) {
    this._parent = kv.parent
    this.type = kv.parent ? 'scope' : 'root'
    this.containerName = kv.name
  }

  request<T extends { new (...x); request }>(klass: T): InstanceType<T> {
    return klass.request()
  }

  child(name?: string) {
    let obj = new DependencyContainer({ parent: this, name })
    return obj
  }

  registerByLabel(label: string, value) {
    let exists = !!this._contentByLabel[label]
    if (exists) {
      throw Error(`Value for label :${label} already defined`)
    }
    this._contentByLabel[label] = value
  }

  fetchByLabel(label: string, kv: { unsafe?: boolean } = {}) {
    let found = this._contentByLabel[label]
    if (kv.unsafe !== true) {
      if (found === undefined) {
        throw Error(`Unknown value :${label}`)
      }
    }
    return found
  }

  _getDependencyMeta(klass): DependencyMeta {
    let meta = this._content.get(klass)
    let alt
    if (!meta) {
      let alt = klass[SYM_DependencyConfig]
    }
    if (!meta) {
      if (this._parent) {
        meta = this._parent._getDependencyMeta(klass)
      }
    }
    // $dev({ meta, alt })

    return meta
  }

  _applyInjects_base(kv: TMPInject): Promise<unknown>[] {
    let { target, create } = kv
    let allAsync = []
    let dependencies = getDependencyMarkers(target)

    for (let depItem of dependencies) {
      let key = depItem.key
      try {
        let r1 = this._fetch({
          klass: depItem.marker.klass,
          buildParams: depItem.marker.options,
          create: kv.create,
          marker: depItem.marker,
        })

        let dependencyResolved = r1.value

        // recurse to apply container and resolve deeper dependencies
        let r2 = this._applyInjects_base({
          target: dependencyResolved,
          create: kv.create,
        })
        // TODO wtf?? are you awaiting Promise.all flat??
        allAsync = allAsync.concat(r2)

        target[key] = dependencyResolved

        // TODO:ugly-double-create ?? needed?
        let freshlyBuilt = r1.meta?.lifetime !== 'value'

        if (r1.config?.createAsync && freshlyBuilt) {
          let instance = r1.value
          if (!instance[SYM_STARTED]) {
            instance[SYM_STARTED] = true
            allAsync.push(r1.config.createAsync(instance))
          }
        }
        if (isPromise(dependencyResolved)) {
          let next = dependencyResolved
            .then(x => (target[key] = x))
            .catch(e => {
              let error = CustomError.create(
                'Failed to inject async dependency',
                {
                  cause: e,
                },
              )
              throw error
            })
          allAsync.push(next)
        }
      } catch (e) {
        let data = {
          target: target.name ?? target.constructor?.name,
          key,
          container: this,
        }
        // $dev(data)
        let error = Error('Unable to inject value')
        error.cause = e
        error.data = data
        throw error
      }
      //
    }

    if (typeof target === 'object') {
      target[SYM_CONTAINER] = this
    }

    // $dev('-Ready', {})
    if (kv.starter) {
      // TODO:start_after_finish
      if (kv.starter.type === 'background') {
        kv.starter.execute()
      }
      // kv.starter.execute(target)
    }

    // if (allAsync.length) {
    //   $dev.trace()
    // }
    return allAsync
  }

  applyInjectsSync(kv: TMPInject) {
    let allAsync = this._applyInjects_base(kv)
    if (allAsync.length) {
      throw Error('Async dependencies found')
    }
  }

  async applyInjectsAsync_EXTERNAL(target) {
    await this.applyInjectsAsync_DROP(target)
  }

  private async applyInjectsAsync_INTERNAL(kv: TMPInject) {
    let allAsync = this._applyInjects_base({
      target: kv.target,
      create: kv.create,
    })
    await Promise.all(allAsync)
  }

  async applyInjectsAsync_DROP(obj) {
    let starts = []

    Object.entries(obj).forEach(([key, value]) => {
      if (InjectMarker.is(value)) {
        let node =
          this._getDependencyMeta(value.klass) ?? //
          // value.klass[SYM_DependencyConfig] ??
          null
        if (!node) {
          $dev(value.klass)
          let msg = `Could not resolve injected dependency "${key}"`
          // $dev({ key, value, obj, alt: value.klass[SYM_DependencyConfig] })
          throw Error(msg)
        }
        let res = node.value
        switch (node.lifetime) {
          // TODO:transient
          case 'transient':
          case 'value': {
            break
          }
          case 'scope':
          case 'singleton': {
            if (!res) {
              res = node.create(this)
              if (isPromise(res)) {
                starts.push(
                  res.then(x => {
                    obj[key] = x
                  }),
                )
              }
            }
            break
          }
          case 'global':
          case 'auth':
            throw Error('todo')
          default: {
            assertNever(node.lifetime)
          }
        }
        if (!res) {
          throw Error(`Could not resolve dependency :${key}`)
        }
        obj[key] = res
      }
    })
    await Promise.all(starts)
  }

  fetchValue<T>(klass: SomeClass<T>, name: string): T {
    let store = this._contentByName.get(klass)
    let found = store[name].value
    return found as T
  }

  _afterFetch({ result, create }: { result: FetchResult<any>; create }) {
    let cond = isAsyncResult(result)
    // TODO dedup?? guard
    if (cond) {
      throw Error('Async dependency, use .fetchAsync ')
    }

    // TODO:dc-strict
    // this.applyInjectsSync({ target: res.value, create: false })
    this.applyInjectsSync({
      target: result.value,
      create,
      starter: result.starter,
    })
  }

  // fetchToken<T>(klass: { new (): DependencyToken<T> }): T
  private _fetchToken<T>(klassToken: DependencyToken<T>): T | Promise<T> {
    let found = this._getDependencyMeta(klassToken)
    if (found) return found.value

    let lifetime: ILifeTime = klassToken._dsl.lifetime ?? 'transient'

    if (klassToken._dsl.presetValue) {
      throw Error(`Token requires value to be preset as :${lifetime}`)
    }

    let finish = next => {
      this.applyInjectsSync({ target: next })

      if (lifetime === 'transient') {
        return next
      }

      // TODO #bug should allocate according lifetime #now

      // $dev({ klassToken, that: this._content })
      this._writeContent({ key: klassToken, lifetime, value: next })
    }

    let next = klassToken._dsl.create(this)
    if (isPromise(next)) {
      // @ts-expect-error TODO
      next.then(x => finish(x))
    } else {
      finish(next)
    }
    return next
  }

  private _writeContent(kv: { lifetime: ILifeTime; value: any; key }) {
    let meta = new DependencyMeta()
    meta.lifetime = kv.lifetime
    meta.value = kv.value
    let dc = this as DependencyContainer
    if (kv.lifetime === 'singleton') {
      // $dev(this._parent)
      dc = findContainer(this, { type: 'root' })
    }
    dc._content.set(kv.key, meta)
  }

  fetch_T<T>(thing: DependencyToken<T>): T {
    return null
  }

  // fetch<T>(thing: typeof ValueReference<T>): T
  fetch<T>(thing: DependencyToken<T>): T
  fetch<T extends { new (...x) }>(
    klass: T,
    kv?:
      | {
          params?: MyParams<T>
        }
      | {
          args?: ConstructorParameters<T>
        },
  ): InstanceType<T>

  fetch<T extends { new (...x) }>(
    klass: T,
    kv:
      | {
          params?: MyParams<T>
        }
      | {
          args?: ConstructorParameters<T>
        } = {},
  ) {
    let result: FetchResult<InstanceType<T>>
    if (DependencyToken.is(klass)) {
      let res = this._fetchToken(klass)
      if (isPromise(res)) {
        throw new DependencyError(
          `Token has async creation. Use either .fetchAsync or .warmup`,
        )
      }
      return res
    }
    result = this.fetch_X({
      klass,
      params: 'params' in kv ? kv.params : undefined,
      args: 'args' in kv ? kv.args : undefined,
    })

    if (isPromise(result.value)) {
      throw Error('Async dependency, use .fetchAsync ')
    }

    return result.value
  }

  fetch_X<T extends { new (...x) }>(kv: {
    klass: T
    params?: ConstructorParameters<T>[0]
    args?: ConstructorParameters<T>
    _create?
  }): FetchResult<InstanceType<T>> {
    let result = this._fetch({
      klass: kv.klass,
      create: kv._create,
      buildParams: kv.params,
      buildArgs: kv.args,
    })
    if (isAsyncResult(result)) {
      let valueBefore = result.value
      let doAsync = async () => {
        let value = await valueBefore
        if (result.meta?.lifetime !== 'value') {
          // previously created, no need to re-create
          $dev('..async 1')
          await this.applyInjectsAsync_INTERNAL({ target: value })
          // $dev(res)
          await result.config?.createAsync?.(value)
          return value
        }
      }
      result.value = doAsync()
    } else {
      this._afterFetch({ result, create: null })
    }

    // TODO clean
    result.meta = null
    return result
  }

  create_2<T, TPar extends any[]>(
    klass: { new (...x: TPar): T },
    ...x: TPar
  ): T {
    let res = this._fetch({ klass, buildArgs: x, create: true, passDC: false })
    // let next = new klass(this, buildParams)
    // let res = { value: next }
    this._afterFetch({ result: res, create: true })
    return res.value
  }

  create<T, TPar>(klass: DepKlass<T, TPar>, buildParams?: TPar): T {
    let res = this._fetch({ klass, buildParams, create: true })
    // let next = new klass(this, buildParams)
    // let res = { value: next }
    this._afterFetch({ result: res, create: true })
    return res.value
  }

  async fetchAsync<T>(klass: DependencyToken<T>): Promise<T>
  async fetchAsync<T>(klass: { new (...x): T }): Promise<T>
  async fetchAsync(klass) {
    if (null as any) {
      // let result: FetchResult<InstanceType<T>>
      let result: FetchResult<any>
      result = this.fetch_X({
        klass,
        // params: 'params' in kv ? kv.params : undefined,
        // args: 'args' in kv ? kv.args : undefined,
      })

      if (!isPromise(result.value)) {
        // throw Error('Sync dependency, use .fetch')
      }
      return result.value
    }

    if (DependencyToken.is(klass)) {
      return await this._fetchToken(klass)
    }

    let res = this._fetch({ klass })
    let value = await res.value

    if (res.meta?.lifetime !== 'value') {
      // previously created, no need to re-create
      await this.applyInjectsAsync_INTERNAL({ target: value })
      // $dev(res)
      await res.config?.createAsync?.(value)
    }
    return value
  }

  async createAsync<T>(klass: { new (...x): T }): Promise<T> {
    let res = this._fetch({ klass, create: true })
    let value = await res.value
    await this.applyInjectsAsync_INTERNAL({ target: value })
    await res.config?.createAsync?.(value)
    return value
  }

  private _fetch<T>(kv: {
    klass: { new (...x): T }
    buildParams?
    buildArgs?
    create?: boolean
    marker?: InjectMarker
    passDC?
  }): FetchResult<T> {
    let { klass, buildParams } = kv
    let found = this._getDependencyMeta(klass)
    let config: DependencyClassConfig<T> = klass[SYM_DependencyConfig]
    let starts = []
    let myStarter: IStarter
    let found_tmp: DependencyClassConfig = {
      lifetime: 'transient',
      passContainer: false,
    }

    if (found) {
      switch (found.lifetime) {
        // TODO:transient
        case 'transient':
        case 'value': {
          if (found.create) {
            // found = { ...found, value: found.create(this, buildParams) }
            //
            let _customCreate = () => found.create(this, kv.buildParams)
            let instance = this._create({
              klass: null,
              _customCreate,
            })

            // found = this._createDependency({ found, buildParams })
            found.value = instance
          }
          break
        }
        case 'scope':
        case 'singleton': {
          if (!found.value) {
            if (config?.isValue === true) {
              throw Error(`Container must define value :${klass.name}`)
            }
            found.value = found.create(this)
            let starter = klass[SYM_CLASS_START] as StartConfig
            if (starter) {
              let execute

              if (starter.startType === 'background') {
                execute = () => {
                  let res = found.value[starter.method]()
                  starts.push(res)
                }
              } else if (starter.startType === 'await') {
                // $dev('Container AsyncCreate', this.containerName)

                execute = () => found.value[starter.method](found.value)
              } else {
                throw Error('unknown start type')
              }
              myStarter = { type: starter.startType, execute }

              // NOW drop
              let doStart = () => {
                if (starter.startType === 'background') {
                  execute = () => found.value[starter.method]()
                  // starts.push(execute())
                } else if (starter.startType === 'await') {
                  // $dev('Container AsyncCreate', this.containerName)

                  let started = false
                  execute = () => {
                    // TODO needed? can avoid drop this guard?
                    if (started) return
                    started = true
                    let run = found.value[starter.method](found.value)
                    return run
                  }

                  config.createAsync = execute
                } else {
                  throw Error('unknown start type')
                }
              }
              // TODO:start_after_finish
              // $dev('-DoStart')
              doStart()
            }
          }
          break
        }
        case 'global':
        case 'auth':
          throw Error('auth')
        default: {
          assertNever(found.lifetime)
        }
      }

      return {
        value: found.value,
        config,
        meta: found,
        starts,
        starter: myStarter,
      }
    } else if (config) {
      if (this._parent && config.lifetime === 'singleton')
        return this._parent._fetch({ klass, buildParams, create: kv.create })
      switch (config.lifetime) {
        // TODO:transient
        case 'transient': {
          return { value: config.create(this, buildParams) }
        }
        case 'value': {
          let error = new DependencyError(
            `Value for dependency must be manually pre-defined :${klass.name}`,
          )
          throw error
        }

        case 'singleton': {
          this.registerSingleton(klass, config.create)
          break
        }
        case 'scope': {
          if (!this._parent) {
            throw Error(
              `Refusing to have a :scope dependency "${klass.name}" in root container`,
            )
          }
          this.registerScope(klass, config.create)
          break
        }
        case 'global':
        case 'auth': {
          throw Error('todo')
        }
        default: {
          assertNever(config.lifetime)
        }
      }
      return this._fetch({ klass, buildParams, create: kv.create })
    } else {
      if (!kv.create) {
        // $dev.trace()
        // throw Error(`No dependency value OR config found for :${klass.name}`)
      }

      // TODO #clean drop passDC? or make it default
      let passContainer = kv.marker?.passContainer
      if (kv.passDC === false) {
        passContainer = false
      } else {
        passContainer ??= true
      }
      let next = this._create({
        klass,
        _passContainerToConstructor: passContainer,
        constructorParams: buildParams,
        constructorArgs: kv.buildArgs,
      })

      // No config and no previously stored
      return { value: next, meta: found_tmp }
      // //$dev({ klass, container: this })
      // throw Error(`Unknown dependency "${klass.name}"`)
    }
  }

  registerValue_1(thing, value) {
    if (isPromise(thing)) {
      throw Error(`Promises are not valid container values`)
    }
    this._content.set(thing, { lifetime: 'value', value })
    return this
  }

  registerValue_name<T>(kv: { klass: SomeClass<T>; name: string; value: T }) {
    let { klass, name, value } = kv
    let factory = this._contentByName.get(klass) || {}
    factory[name] = { value }
    this._contentByName.set(klass, factory)
  }

  registerValue(
    thing: { constructor: Function },
    kv: { klass?: { new () } } = {},
  ) {
    if (isPromise(thing)) {
      throw Error(`Promises are not valid container values`)
    }

    let value = thing
    let klass = kv.klass ?? value.constructor

    // TODO drop?
    if (typeof thing === 'function') {
      if (!kv.klass) {
        throw Error('Must provide class with builder function')
      }
    }

    if (this._content.get(klass)) {
      throw Error(`Value already registered :${klass.name}`)
    }

    // TODO review? test?
    if (value[SYM_CONTAINER]) {
      if (value[SYM_CONTAINER] === this) {
        throw Error('Already registered!')
      } else {
        throw Error('Already in other container')
      }
    } else {
      value[SYM_CONTAINER] ??= this
    }

    this._content.set(klass, { lifetime: 'value', value })
  }

  register_OLD_1<T>(
    // thing: { new (...x: any[]) },
    thing: DepKlass<T, any>,
    builder: (container: DependencyContainer) => void,
  ) {
    let conf = thing[SYM_DependencyConfig]
    if (!conf) {
      throw Error(`Cannot register class without @DC.injectable configuration`)
    }
    this._content.set(thing, {
      lifetime: conf.lifetime,
      create: builder,
    })
  }

  registerSingleton(thing, create: ICreate) {
    this._content.set(thing, {
      lifetime: 'singleton',
      value: null,
      create: create,
    })
  }

  registerScope<T>(klass: DepKlass<T, unknown>, create: ICreate) {
    create ||= function defaultCreate() {
      // @ts-expect-error TODO
      return new klass()
    }
    // create ||= function defaultCreate() {
    //   return new constructor()
    // }
    this._content.set(klass, {
      lifetime: 'scope',
      value: null,
      create: create,
    })
  }

  hijack_2<T>(t1: { new (...x): T }, t2?: (dsl: { create(): T }) => T)
  hijack_2<T>(kv: HijackDSL<T>, t2?: never)
  hijack_2<T>(t1, t2) {
    let dsl: HijackDSL<T> =
      typeof t2 === 'function' ? { klass: t1, create: t2 } : t1
    this._hijack_2.set(dsl.klass, dsl)
  }

  hijack<T>(
    klass: DepKlass<T, any>,
    cb: (kv: { container: DependencyContainer; instance: T }) => T | void,
  ) {
    let meta = this._content.get(klass)
    if (!meta) {
      meta = klass[SYM_DependencyConfig]
      if (!meta) {
        throw Error(`Non injectable class "${klass.name}"`)
      }
      this._content.set(klass, meta)
    }

    let original = meta.create

    // TODO:dry-create #dirty risk of #dry
    meta.create = function myCreate(container, buildParams) {
      let instance = original(container, buildParams)
      instance[SYM_CONTAINER] = container

      let next = cb({ container, instance })
      return next ?? instance
    }
    // this._meta.set(klass, {
    //   lifetime: 'transient',
    //   value: null,
    //   // create(container) {
    //   //   return cb({ container })
    //   // },
    // })
    return this
  }

  static after() {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {}
  }

  async stop() {
    $log.info('Stop all dependencies')
    let stops_1 = Array.from(this._content.values()).map(x => {
      // TODO #wtf complicated way? #clean to have directly in this._content
      let config = DependencyMeta.get(x.value.constructor)

      // TODO #wtf why check if config? not null
      if (config?.stop) {
        return x.value[config.stop.method]()
      }
    })

    let stops_2 = Array.from(this._contentByName.values()).map(group => {
      return Object.values(group).map(x => {
        let value = x.value
        // TODO #wtf complicated way? #clean to have directly in this._content
        let config = DependencyMeta.get(value.constructor)
        if (config.stop) {
          return value[config.stop.method]()
        }
      })
    })

    await Promise.all([...stops_1, stops_2])
  }

  mock<T>(klass): DependencyContainer
  mock<T>(klass: { new (...x): T }, thing: (() => T) | T): DependencyContainer
  mock(klass, t2?): DependencyContainer {
    if (process.env.NODE_ENV !== 'test') {
      throw Error('No container mocks allowed outside TESTING env')
    }

    if (t2) {
      let arg1 = typeof t2 === 'function' ? t2 : () => t2
      let dm = DependencyMeta.get(klass)
      let k = dm?.mockingClass ?? klass
      this._hijack.set(k, arg1)
      // SpecAfterSignal.build().once(() => {
      //   this._hijack
      // })
    } else {
      let value = klass
      klass = klass.constructor
      let dm = DependencyMeta.get(klass)
      let k = dm?.mockingClass ?? klass
      this._hijack.set(k, () => value)
    }

    return this
  }
  mock_2<T>(klass: { new (...x): T }, cb: (dsl: MyDSL<T>) => T) {
    this.hijack_2({ klass, mock: cb })
  }

  doCreate<T>(klass: { new (...x): T }, create: () => T): T {
    return this._create({ klass })
  }

  /** All the logic when a dependency is freshly constructed
   * - be aware if mock/stubbing needed
   * - set the constructor used to create
   * - know if this container must be passed as argument to container
   */
  _create<T>(kv: {
    klass: { new (...x): T }
    create?: () => T
    constructorParams?: unknown
    constructorArgs?: unknown[]

    // TODO drop
    _customCreate?

    // TODO drop after this defaults to false
    _passContainerToConstructor?
  }): T {
    // TODO drop  kv.class condition/check after dropping _customCreate
    let config = kv.klass ? DependencyMeta.get(kv.klass) : null
    let args = []

    // TODO default to no!
    if (config?.passContainer !== false) {
      if (kv._passContainerToConstructor) {
        args.push(this)
      }
    }
    if (kv.constructorParams) {
      args.push(kv.constructorParams)
    } else if (kv.constructorArgs) {
      args.push(...kv.constructorArgs)
    }
    if (process.env.NODE_ENV === 'test') {
      let findAll = (dc: DependencyContainer, klass) => {
        if (!dc) return null
        let found = dc._hijack.get(klass)
        if (found) return found
        return findAll(dc._parent, klass)
      }

      let mock = findAll(this, kv.klass)
      if (mock) {
        // TODO use args?
        return mock()
      }
    }

    let obj
    if (kv._customCreate) {
      obj = kv._customCreate()
    } else {
      obj = new kv.klass(...args)
    }
    obj[SYM_CONTAINER] = this

    return obj
  }

  static createEasy(dc: DependencyContainer, klass, params) {
    if (dc) {
      return dc.fetch(klass, { params })
    }
    return new klass(params)
  }

  async warmup(token: MaybeArray<DependencyToken<any>>) {
    let all = [].concat(token)

    for (let token of all) {
      await this._fetchToken(token)
    }
  }

  create_Object<T extends { new (...x) }>(kv: {
    klass: T
    create: () => InstanceType<T>
  }): InstanceType<T> {
    let found = this._hijack_2.get(kv.klass)
    if (found) {
      // if (found.create) {
      //   return found.create()
      // }
      if (found.mock) {
        let res
        found.mock({
          create() {
            res = kv.create()
            return res
          },
        })
        return res
      }
      $log.error('Unknown case')
    }
    return kv.create()
  }

  async drop(klass: { new (...x) }) {
    this._content.delete(klass)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let all = []
    let size = this._content.size
    all.push(size)
    if (this._parent) {
      // size += this._parent._meta.size
      all.unshift(this._parent._content.size)
    }

    // TODO ideally a clear name path ie: 'root/user'
    let name = this.type
    if (this.containerName) {
      name += ':' + this.containerName
    }

    let parts = [`"${name}"`, `size=${all.join(':')}`]

    let f1 = this._hijack.size
    if (f1) {
      parts.push(`mocks=${f1}`)
    }

    return `<${this.constructor.name} ${parts.join(' ')}>`
  }
}

DependencyContainer.mark = {
  start: DependencyContainer.start.bind(DependencyContainer),
  stop: DependencyContainer.stop.bind(DependencyContainer),
}

function isAsyncResult(result: FetchResult<any>) {
  let cond = false
  if (isPromise(result.value)) {
    cond = true
    // throw Error('Async dependency, use .fetchAsync ')
  } else if (result.config?.createAsync) {
    cond = true
    // throw Error('Async construction, use .fetchAsync ')
  } else {
    cond = false
  }
  return cond
}
