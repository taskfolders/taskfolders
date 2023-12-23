import type { ILifeTime } from './DependencyMeta'

export class DependencyToken<T> {
  name?: string
  type: ILifeTime
  create: () => T

  static is(thing): thing is DependencyToken<any> {
    return thing instanceof DependencyToken
  }

  static define<T>(kv: {
    name?: string
    type?: ILifeTime
    create(): T
  }): DependencyToken<T> {
    let obj = new this<T>()
    obj.name = kv.name ?? this.constructor.name
    obj.type = kv.type ?? 'transient'
    obj.create = kv.create
    return obj
  }
}
