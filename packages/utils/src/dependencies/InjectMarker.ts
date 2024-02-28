import { SYM_DependencyConfig } from './DependencyContainer.draft.js'

export class InjectMarker {
  __INJECT = true
  klass: { new (...x) }
  options
  passContainer

  get config() {
    return this.klass[SYM_DependencyConfig]
  }

  static is(x): x is InjectMarker {
    return x?.__INJECT === true
  }

  static build(kv: { klass; ops?; passContainer? }) {
    let { klass, ops } = kv
    let obj = new this()
    obj.klass = klass
    obj.options = ops
    obj.passContainer = kv.passContainer

    return obj
  }
}
