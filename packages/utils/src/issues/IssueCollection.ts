import { IssueGateway } from './IssueGateway.js'
import { IssueItem } from './IssueItem.js'

export class IssueCollection {
  all: IssueItem<any, any>[] = []

  static from(all: IssueItem<any, any>[]) {
    let obj = new this()
    obj.all = all
    return obj
  }

  push(isu: IssueItem<any, any>) {
    if (!isu) return
    this.all.push(isu)
    return this
  }

  // ..
  find<T, P>(klass: typeof IssueItem<T, P>): IssueItem<T, P> {
    return this.all.find(x => x.code === klass.code)
  }

  fail(kv: { code } & Partial<IssueItem>) {
    this.push(new IssueItem(kv))
  }

  warn(kv: { code } & Partial<IssueItem>) {
    this.push(new IssueItem({ ...kv, severity: 'warning' }))
  }

  hasErrors() {
    return !!this.all.find(x => x.severity === 'error')
  }

  hasWarnings() {
    return !!this.all.find(x => x.severity === 'warning')
  }

  hasIssues() {
    return this.all.length > 0
  }

  // -------------------
  // Array like
  map<T>(cb: (issue: IssueItem) => T): T[] {
    return this.all.map(cb)
  }

  *[Symbol.iterator]() {
    let index = 0
    while (index < this.all.length) {
      let item = this.all[index]
      index++
      yield item
    }
  }
}
