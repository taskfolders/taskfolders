import { IssueItem } from './IssueItem'

interface CheckContext<T> {
  message?: string
}
export class IssueGateway {
  config = {}

  check<T, P>(
    isu: typeof IssueItem<T, P>,
    cb: (t: CheckContext<T>) => T extends void ? Boolean | void : T | void,
  ): IssueItem<T, P> {
    if (isu.code) {
      if (this.config[isu.code]?.status === 'off') return
    }
    let ctx: CheckContext<T> = {}
    let r1 = cb(ctx)
    if (r1 === false || typeof r1 === 'object') {
      let res = new isu({ code: isu.code, message: ctx.message })
      if (typeof r1 === 'object') {
        res.data = r1 as any
      }
      return res
    }
  }

  with(col: { push(x: IssueItem<any>) }) {
    let that = this
    let running: Promise<any>[]
    return {
      check(klass, cb) {
        let res = that.check(klass, cb)
        if (res) col.push(res)
        return this
      },
      done() {
        return Promise.all(running)
      },
    }
  }
}
