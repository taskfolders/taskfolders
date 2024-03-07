import { FindCaller } from '../runtime/stack/locate/FindCaller.js'
import { SourcePosition } from '../runtime/position/SourcePosition.js'

type IssueSeverity = 'error' | 'warning' | 'info' | 'update'

type IsSubclass<T, U> = T extends U ? (U extends T ? never : T) : never

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
  sourceCode?: SourcePosition

  static test: (x) => any

  static is(issue: IssueItem) {
    return issue.code === this.code
  }

  static foo<T extends typeof IssueItem>(
    this: T,
    // This type parameter is required only when calling from the base class
    param: T extends IsSubclass<IssueItem, T> ? string : number,
  ) {
    //
  }

  static create<T extends IssueItem>(
    this: { new (x): T },
    kv: { code: string } & Partial<
      Pick<IssueItem<any, any>, 'message' | 'severity' | 'fix' | 'data'>
    >,
  ) {
    let obj = new this(kv)

    // TODO review or #rf up
    if (kv?.fix) obj.fix = kv.fix
    if (kv?.data) obj.data = kv.data

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

      static create<T extends IssueItem>(
        this: { new (x): T },
        kv?: Partial<
          Pick<IssueItem<any, any>, 'message' | 'severity' | 'fix' | 'data'>
        >,
      ) {
        super.create(kv as any)
        return null
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
    this.sourceCode = FindCaller.whenDevelopment({ offset: 2 })
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let sev = this.severity.toUpperCase()
    return `<Issue ${sev} "${this.code}">`
  }
}
