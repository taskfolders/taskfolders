import { CustomError } from '../errors/CustomError.js'
import { isPromise } from '../native/promise/isPromise.js'

export const SYM = Symbol('taskfolders.com:DataModel')

export const DataModelError = CustomError.defineGroup('DataModelError', {
  invalidType: class extends CustomError {
    message = 'Unable to verify wanted model type'
    static code = 'invalid-type'
    static create(kv: { wanted; given }) {
      let obj = new this()
      obj.data = kv
      return obj
    }
  },
})

type Foo<T> = Partial<{ [key in keyof T]: { parse?(x): T[key] } }>

type ParseResult<T> =
  | { ok: false; error: Error }
  | { ok: true; result: T; unknownKeys: any }

class ParseContext<Model extends Record<string, any>, Key extends keyof Model> {
  model: Model
  input: any
  value: Model[Key]
  fail
  issue

  static create(kv: Pick<ParseContext<any, any>, 'model' | 'input'>) {
    let obj = new this()
    obj.model = kv.model
    obj.value = kv.input
    obj.input = kv.input
    return obj
  }
}

export class ModelDefinition<T> {
  type: { value: string; field?: string }
  before: (doc) => void
  properties: Record<string, { fromJSON?; parse?(kv: ParseContext<T, any>) }>

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

export class DataModel<T extends { new () }> {
  klass: T
  model: InstanceType<T>

  static prop() {
    return function () {}
  }

  static from<T extends { new () }>(klass: T): DataModel<T> {
    let obj = new this<T>()
    obj.klass = klass
    return obj
  }

  get meta() {
    return ModelDefinition.get(this.klass)
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
          parse?(kv: ParseContext<T, key>): void
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

  static deserialize<T>(klass: { new (): T }, doc) {
    let res = this.parse(klass, doc)
    if (res.ok === false) {
      throw res.error
    }
    return res.result
  }

  applyDocument(
    doc: unknown,
    ops: { strict? } = {},
  ): ParseResult<InstanceType<T>> {
    this.model ??= new this.klass()
    let model = this.model
    let def = this.meta
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
            error = DataModelError.invalidType.create({ wanted, given })
            return { ok: false, error }
          }
        }
      }
    }

    let unknownKeys = []
    if (ops.strict) {
      let copy = { ...(doc as any) }
      Object.entries(def.properties).forEach(([key, value]) => {
        model[key] = value
        delete copy[key]
      })
      unknownKeys = Object.keys(copy)
    } else {
      Object.assign(model, doc)
    }

    if (def.properties) {
      Object.entries(def.properties).forEach(([key, config]) => {
        config ??= {}
        let value = doc[key]
        if (value) {
          if (config.fromJSON) {
            model[key] = config.fromJSON(value)
          }

          if (config.parse) {
            let ctx = ParseContext.create({ input: value, model })
            config.parse(ctx)
            model[key] = ctx.value
          }
        }
      })
    }

    return { ok: true, result: model, unknownKeys }
  }

  static parse<T>(
    klass: { new (): T },
    doc: unknown,
    ops: { strict? } = {},
  ): ParseResult<T> {
    return this.from(klass).applyDocument(doc, ops)
  }

  static async parseAsync<T>(klass: { new (): T }, doc) {
    throw Error('todo')
  }

  onEachProperty(map: { [key in keyof InstanceType<T>]: any }) {}
}
