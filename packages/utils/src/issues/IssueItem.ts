import { FindCaller } from '../stack/locate/FindCaller'
import { CodePosition } from '../stack/locate/getCallerFile'

/**
 */

export class IssueItem<T = unknown, Params = void> {
  static code: string
  code: string
  message?: string

  // TODO review update
  severity: 'error' | 'warning' | 'info' | 'update'
  data?: T
  test?: (x: Params) => any

  url?: string
  fix?
  sourceCode?: CodePosition

  static create(
    kv: { code: string } & Partial<
      Pick<IssueItem<any, any>, 'message' | 'severity'>
    >,
  ) {
    let obj = new this(kv)
    return obj
  }

  static define<X, Y = void>(kv: {
    code: string
    test?(x: Y)
    message?: string
    url?: string
  }) {
    return class extends IssueItem<X, Y> {
      static override code = kv.code
      constructor(
        // TODO #ts
        par = {} as any,
      ) {
        super({ code: kv.code, message: par.message ?? kv.message })

        // TODO move up into super?
        this.url = kv.url
      }
      static test = kv.test
    }
  }

  constructor(kv: { code: string; message?: string }) {
    this.code = kv.code
    this.severity ||= 'error'
    if (kv.message) {
      this.message = kv.message
    }
    this.sourceCode = FindCaller.whenNotProduction({ offset: 2 })
  }
}
