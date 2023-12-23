export type StartType = 'background' | 'await'
const SYM_DependencyConfig = Symbol('taskfolders.com:dependency.class-config')
export type ILifeTime = 'singleton' | 'transient'
// | 'value'
// | 'scope'
// | 'global'
// | 'auth'
export class DependencyMeta {
  lifetime: ILifeTime
  // create?: ICreate
  // stop?: StopConfig
  // start?: StartConfig
  start?
  mockingClass?
  value? // ?: SomeClass

  // create?(container: DependencyContainer)
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
