import { isPromise } from '../native/promise/isPromise.js'

export const SYM = Symbol('taskfolders.com:DataModel')

type Foo<T> = Partial<{ [key in keyof T]: { parse?(x): T[key] } }>

class ModelDefinition<T> {
  type
  before: (doc) => void
  properties: Record<string, { parse? }>

  static getsert<T>(klass): ModelDefinition<T> {
    klass[SYM] ??= new this()
    //klass[SYM] ??= klass.__definition ?? new this()
    //klass.__definition = klass[SYM]
    return klass[SYM]
  }

  static get<T>(klass): ModelDefinition<T> {
    return klass[SYM]
  }
}

export class DataModel {
  static prop() {
    return function () {}
  }

  static decorate<T>(
    klass: { new (): T },
    kv: {
      type?: { value: string; field? }
      before?(doc): Record<string, any>
      properties?: Partial<{ [key in keyof T]: { parse?(x): T[key] } }>
    },
  ) {
    let def = ModelDefinition.getsert(klass)
    def.type = kv.type
    def.before = kv.before
    def.properties = kv.properties
    //
  }

  static parseSync<T>(klass: { new (): T }, doc) {
    let next = new klass()
    let def = ModelDefinition.get(klass)

    if (def) {
      if (def.before) {
        doc = def.before(doc)
        if (!doc) {
          throw Error('Before method must return modified document')
        } else if (isPromise(doc)) {
          throw Error('async .before method detected')
        }
      }

      if (def.type) {
        if (def.type.field) {
          let given = doc[def.type.field]
          let wanted = def.type.value
          if (given !== wanted) {
            let err = Error('Could not identify document type')
            throw err
          }
        }
      }
    }

    Object.assign(next, doc)

    if (def.properties) {
      Object.entries(def.properties).forEach(([key, config]) => {
        let parser = config.parse
        let value = doc[key]
        if (parser && value) {
          next[key] = parser(value)
        }
      })
    }

    return next
  }

  static async parseAsync<T>(klass: { new (): T }, doc) {
    throw Error('todo')
  }
}
