import { toDate } from './toDate.js'
import { isValid } from 'date-fns'

export class TimeMark {
  value
  date
  type: 'date' | 'relative' | 'milestone'

  _milestone?: {
    id?: string
    uid?: string
    done?: boolean
  }

  static fromValue(x) {
    let obj = new this()
    obj.value = x
    let date = toDate(x)
    if (isValid(date)) {
      obj.date = date
      obj.type = 'date'
    } else {
      let match = x.match(/(\d+)(m|y|w|d)/i)
      if (match) {
        let [_, number, key] = match
        obj.type = 'relative'
      } else {
        obj.type = 'milestone'
        obj._milestone = {
          // id: x,
        }
      }
    }
    return obj
  }

  isReady() {
    return new Date()
  }

  toJSON() {
    return this.value.toISOString?.() ?? this.value
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} "${this.value}">`
  }
}
