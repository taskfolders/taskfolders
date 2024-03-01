import { DC } from './DC.js'

export class DCTester {
  dc: DC

  static from(dc: DC) {
    let obj = new this()
    obj.dc = dc
    return obj
  }

  /** @deprecated use .stubFetch */
  hijackCreate(klass, newCreate) {
    let original = this.dc._create
    this.dc._create = (c_klass, kv) => {
      if (c_klass === klass) {
        return newCreate()
      }
      return original(c_klass, kv) as any
    }
  }

  /** @deprecated use .stubFetch */
  stubCreate<T>(klass: { new (...x): T }, cb: () => T) {
    let original = this.dc._create
    this.dc._create = (c_klass, kv) => {
      if (c_klass === klass) {
        return cb()
      }
      return original(c_klass, kv) as any
    }
  }

  stubFetch<T>(
    klass: { new (...x): T },
    cb: (ctx: { fetch(): T; method?; args?: any[] }) => T,
  ) {
    let { dc } = this
    let orig = dc.fetch.bind(dc)
    dc.fetch = (f_klass, kv) => {
      if (klass === klass) {
        return cb({ fetch: orig, ...kv })
      }
      return orig(f_klass)
    }
  }
}
