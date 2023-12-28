import { FindCaller } from '../stack/locate/FindCaller'
import { CodePosition } from '../stack/locate/getCallerFile'

type IssueSeverity = 'error' | 'warning' | 'info' | 'update'

/**
 */

export class IssueItem<T = unknown, Params = void> {
  static code: string
  code: string
  message?: string

  // TODO review update
  severity: IssueSeverity
  data?: T
  test?: (x: Params) => any

  url?: string
  fix?
  sourceCode?: CodePosition

  static test: (x) => any

  static is(issue: IssueItem) {
    return issue.code === this.code
  }

  static create(
    kv: { code: string } & Partial<
      Pick<IssueItem<any, any>, 'message' | 'severity' | 'fix' | 'data'>
    >,
  ) {
    let obj = new this(kv)

    // TODO review or #rf up
    if (kv.fix) obj.fix = kv.fix
    if (kv.data) obj.data = kv.data

    return obj
  }

  static define<X, Y = void>(kv: {
    code: string
    test?(x: Y): void | X
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

  constructor(kv: { code: string; message?: string; severity? }) {
    this.code = kv.code
    this.severity ??= kv.severity ?? 'error'
    if (kv.message) {
      this.message = kv.message
    }
    this.sourceCode = FindCaller.whenNotProduction({ offset: 2 })
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let sev = this.severity.toUpperCase()
    return `<Issue ${sev} "${this.code}">`
  }
}
