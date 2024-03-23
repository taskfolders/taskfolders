//import sinon from 'sinon'
import { $dev } from '../../logger/index.js'
import { TimeService } from './TimeService.js'
//import { isDate } from '.'
// import { isSinon } from '../../_draft/isSinon'
import { parseFuzzyDate } from './helpers.draft.js'

export class TimeServiceMock extends TimeService {
  static _stub

  static restore() {
    this._stub?.restore()
  }

  static fakeTime(thing: string | Date): Date {
    $dev('-todo-')
    return new Date()
    // let service = this.request()
    // let fake = isDate(thing) ? thing : parseFuzzyDate(thing)
    // if (isSinon(service.now)) {
    //   // @ts-expect-error
    //   service.now.restore()
    // }
    // let stub = sinon.stub(service, 'now').returns(fake)
    // this._stub = stub
    // return fake
  }
}
