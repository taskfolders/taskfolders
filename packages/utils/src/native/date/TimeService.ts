// import { requestFactory } from '@zapps/core/runtime/services/factory/RequestService'
// import { $runtime } from '@zapps/core/runtime'
// import { SpecProtocol } from '@zapps/testing/src/SpecProtocol'
// import type { SpecHelper } from '@zapps/core/native/date/TimeService.test'
import { getISOWeek, format } from 'date-fns'
// ////////
// ...

// TODO:review uniqueId -- needs context! ... unique in which set? GlobalRegistry
function uniqueId(target) {
  return id => {}
}

let instance: TimeService

export class TimeService {
  static id = 'time-service'
  static sym = Symbol('time-service')
  // constructor() {
  //   if (isNodeEnv('test')) {
  //     const { SpecHelper } = require('./TimeService.test')
  //     this.spec = new SpecHelper(this)
  //   }
  // }

  static request() {
    instance ??= new TimeService()
    return instance
  }

  static now() {
    return this.request().now()
  }

  static explain(str) {
    let date = new Date(str)
    let week = getISOWeek(date)
    let day = format(date, 'cccc')
    return { week, day }
  }

  now() {
    return new Date()
  }
}
