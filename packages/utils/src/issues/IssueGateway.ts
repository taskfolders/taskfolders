import { IssueItem } from './IssueItem'
import { isPromise } from '../native/promise/isPromise'

interface CheckContext<T> {
  message?: string
}
export class IssueGateway {
  config = {}

  // check<T, P>(
  //   issue: typeof IssueItem<T, P>,
  //   cb: (t: CheckContext<T>) => T extends void ? Boolean | void : T,
  // ): IssueItem<T, P>

  // check<tData, tTest extends Record<string, any>>(
  //   issue: typeof IssueItem<any, any>,
  //   testData: tTest,
  // ): IssueItem<tData, tTest>

  check<tData, tTest, Res>(
    issue: typeof IssueItem<tData, tTest>,
    //cb: (t: CheckContext<T>) => Promise<T> | T,
    cb: ((t: CheckContext<tData>) => Res) | tTest,
  ): Res extends Promise<any>
    ? Promise<IssueItem<tData, tTest>>
    : IssueItem<tData, tTest>

  check<tData, tTest, Res>(
    issue: typeof IssueItem<tData, tTest>,
    //cb: (t: CheckContext<T>) => Promise<T> | T,
    cb: (t: CheckContext<tData>) => Res,
  ) {
    if (issue.code) {
      if (this.config[issue.code]?.status === 'off') return
    }
    let ctx: CheckContext<tData> = {}
    let r1
    if (typeof cb === 'function') {
      r1 = cb(ctx)
    } else {
      r1 = issue.test(cb)
    }
    if (isPromise(r1)) {
      return r1.then(r1 => {
        if (r1 === false || typeof r1 === 'object') {
          let res = new issue({ code: issue.code, message: ctx.message })
          if (typeof r1 === 'object') {
            res.data = r1 as any
          }
          return res
        }
      }) as Promise<IssueItem<tData, tTest>>
    } else {
      if (r1 === false || typeof r1 === 'object') {
        let res = new issue({ code: issue.code, message: ctx.message })
        if (typeof r1 === 'object') {
          res.data = r1 as any
        }
        return res
      }
    }
  }

  applyTo(col: { push(x: IssueItem<any>) } | any[]) {
    let that = this
    let index = 0
    return {
      check(klass, cb) {
        index++
        let res = that.check(klass, cb)
        if (res) {
          col.push(res)
          if (isPromise(res)) {
            res.then(x => {
              // let bef = [...col]
              // @ts-expect-error TODO
              col.splice(index - 2, 1, x)
              // let af = [...col]
              // $dev({ bef, af, x, index })
            })
          }
        }
        return this
      },
      done() {
        return Promise.all(col as any)
      },
    }
  }
}
