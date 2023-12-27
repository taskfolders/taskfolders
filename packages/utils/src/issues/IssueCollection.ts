import { IssueGateway } from './IssueGateway'
import { IssueItem } from './IssueItem'

export class IssueCollection {
  all: IssueItem<any>[] = []

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

  // Gateway
  _gateway: IssueGateway
  gate(gw: IssueGateway) {
    this._gateway = gw
    return this
  }
  check(klass, cb) {
    this._gateway.check(klass, cb)
    return this
  }

  // ..
  find<T, P>(klass: typeof IssueItem<T, P>): IssueItem<T, P> {
    return this.all.find(x => x.code === klass.code) as any
  }

  *[Symbol.iterator]() {
    let index = 0
    while (index < this.all.length) {
      const item = this.all[index]
      index++
      yield item
    }
    yield { value: undefined, done: true }
  }
}
