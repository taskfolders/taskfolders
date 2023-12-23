export type StartType = 'background' | 'await'
export type StartDSL<T> = { method: keyof T; type: StartType }

const SYM_DependencyConfig = Symbol('taskfolders.com:dependency.class-config')

export type ILifeTime = 'singleton' | 'transient' | 'value'
// | 'scope'
// | 'global'
// | 'auth'

export class DependencyMeta {
  lifetime: ILifeTime = 'transient'
  start?: StartDSL<any>
  mockFor?
  destroy: boolean

  // create?: ICreate
  // stop?: StopConfig
  // value? // ?: SomeClass

  // create?(container: DependencyContainer)
  // tags?: string[]
  // passContainer?: boolean

  static get(thing): DependencyMeta {
    return thing[SYM_DependencyConfig]
  }

  static getsert(thing): DependencyMeta {
    thing[SYM_DependencyConfig] ??= {}
    return thing[SYM_DependencyConfig]
  }
}
