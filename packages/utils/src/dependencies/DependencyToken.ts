import { DependencyMeta, ILifeTime } from './DependencyMeta'

export class DependencyToken<T> {
  name?: string
  meta: DependencyMeta
  create: () => T

  static is(thing): thing is DependencyToken<any> {
    return thing instanceof DependencyToken
  }

  static define<T>(
    kv: {
      name?: string
    } & (
      | {
          type?: ILifeTime
          create(): T
        }
      | { type: 'value' }
    ),
  ): DependencyToken<T> {
    let obj = new this<T>()
    obj.name = kv.name ?? this.constructor.name
    if (kv.type !== 'value') {
      obj.create = kv.create
    }

    obj.meta = new DependencyMeta()
    obj.meta.lifetime = kv.type ?? 'transient'
    return obj
  }
}
