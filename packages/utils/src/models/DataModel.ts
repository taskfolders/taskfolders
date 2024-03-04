import { CustomError } from '../errors/CustomError.js'
import { isPromise } from '../native/promise/isPromise.js'

export const SYM = Symbol('taskfolders.com:DataModel')

type Foo<T> = Partial<{ [key in keyof T]: { parse?(x): T[key] } }>

type ParseResult<T> =
  | { ok: false; error: Error }
  | { ok: true; result: T; unknownKeys: any }

export class ModelDefinition<T> {
  type: { value: string; field?: string }
  before: (doc) => void
  properties: Record<string, { fromJSON?; parse?(kv: { fail; issue }) }>

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
      properties?: Partial<{
        [key in keyof T]: {
          fromJSON?(x): T[key]
          require?: boolean
          parse?(kv: { value: T[key]; fail; issue })
        }
      }>
    },
  ) {
    let def = ModelDefinition.getsert(klass)
    def.type = kv.type
    def.before = kv.before
    def.properties = kv.properties
    //
  }

  static fromJSON<T>(klass: { new (): T }, doc) {
    let res = this.parse(klass, doc)
    if (res.ok === false) {
      throw res.error
    }
    return res.result
  }

  static parse<T>(
    klass: { new (): T },
    doc: unknown,
    ops: { strict? } = {},
  ): ParseResult<T> {
    let next = new klass()
    let def = ModelDefinition.get(klass)
    let error

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
            error = new CustomError('Unable to verify wanted model type', {
              name: 'ModelError',
              code: 'invalid-type',
              data: { wanted, given },
            })
            return { ok: false, error }
          }
        }
      }
    }

    let unknownKeys = []
    if (ops.strict) {
      let copy = { ...(doc as any) }
      Object.entries(def.properties).forEach(([key, value]) => {
        next[key] = value
        delete copy[key]
      })
      unknownKeys = Object.keys(copy)
    } else {
      Object.assign(next, doc)
    }

    if (def.properties) {
      Object.entries(def.properties).forEach(([key, config]) => {
        config ??= {}
        let value = doc[key]
        if (value) {
          if (config.fromJSON) {
            next[key] = config.fromJSON(value)
          }

          if (config.parse) {
            let ctx = { value }
            config.parse(
              // @ts-expect-error TODO
              ctx,
            )
            next[key] = ctx.value
          }
        }
      })
    }

    return { ok: true, result: next, unknownKeys }
  }

  static async parseAsync<T>(klass: { new (): T }, doc) {
    throw Error('todo')
  }
}
