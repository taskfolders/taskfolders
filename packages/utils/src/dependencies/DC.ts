import { InjectMarker } from './InjectMarker'
import { ILifeTime, StartType, DependencyMeta } from './DependencyMeta'
import { assertNever } from '../types/assertNever'

type Dependency<T> =
  | { create(): T; name?: string }
  | { new (...x): T; name: string; create?(): never }

export class DC {
  _content = new Map<any, any>()

  static inject<T>(klass: Dependency<T>) {
    return InjectMarker.build({ klass })
  }

  static decorate<T>(
    klass: { new (...x): T },
    kv: {
      lifetime?: ILifeTime
      start?: { method: keyof T; type: StartType }
    },
  ) {
    // $dev('deco!')
    let meta = DependencyMeta.getsert(klass)
    meta.lifetime = kv.lifetime ?? 'transient'
    meta.start = kv.start
    //
  }

  finish(target, kv: { dependencies?; keyPath?; meta?: DependencyMeta } = {}) {
    let acu = kv.dependencies ?? []
    let keyPath = kv.keyPath ?? []
    Object.entries(target).forEach(([key, value]) => {
      if (InjectMarker.is(value)) {
        let res = this.fetchRaw({
          klass: value.klass,
          dependencies: acu,
          keyPath: [key],
        })
        let next = {
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
  }) {
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
    let final = { name: kv.klass.name, type, instance, dependencies, start }
    return final
  }
}
