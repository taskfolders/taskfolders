import { toDate } from './toDate.js'
import { isValid } from 'date-fns'

function getMonthNumber(str) {
  const months = [
    { names: ['january', 'jan'], number: 1 },
    { names: ['february', 'feb'], number: 2 },
    { names: ['march', 'mar'], number: 3 },
    { names: ['april', 'apr'], number: 4 },
    { names: ['may'], number: 5 },
    { names: ['june', 'jun'], number: 6 },
    { names: ['july', 'jul'], number: 7 },
    { names: ['august', 'aug'], number: 8 },
    { names: ['september', 'sep', 'sept'], number: 9 },
    { names: ['october', 'oct'], number: 10 },
    { names: ['november', 'nov'], number: 11 },
    { names: ['december', 'dec'], number: 12 },
  ]

  const input = str.trim().toLowerCase()

  for (const month of months) {
    if (month.names.includes(input)) {
      return month.number
    }
  }

  return null
}

export class TimeMark {
  value
  date
  type: 'date' | 'relative' | 'reference'

  _milestone?: {
    id?: string
    uid?: string
    done?: boolean
  }

  static fromValue(txt) {
    if (txt instanceof TimeMark) return txt
    let obj = new this()
    obj.value = txt
    let date = toDate(txt)
    if (isValid(date)) {
      obj.date = date
      obj.type = 'date'
    } else {
      let match = txt.match(/(\d+)(m|y|w|d)/i)
      if (match) {
        let [_, number, key] = match
        obj.type = 'relative'
      } else {
        let num = getMonthNumber(txt)
        if (num) {
          obj.type = 'relative'
        } else {
          obj.type = 'reference'
          obj._milestone = {
            // id: x,
          }
        }
      }
    }
    return obj
  }

  isReady() {
    return new Date()
  }

  solveRelative(now: Date = new Date()) {
    if (this.type !== 'relative') {
      throw new Error(`Cannot solve relative time mark of type ${this.type}`)
    }
    let parts = {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth(),
      day: now.getUTCDate(),
    }
    let txt = this.value
    let match = txt.match(/(\d+)(m|y|w|d)/i)
    if (match) {
      let [_, number, key] = match
    } else {
      let num = getMonthNumber(txt)
      if (num) {
        parts.month = num - 1
      }
    }
    let next = new Date(Date.UTC(parts.year, parts.month, parts.day))

    let value = [parts.year, parts.month + 1, parts.day].join('-')
    return TimeMark.fromValue(value)
  }

  toJSON() {
    return this.value.toISOString?.() ?? this.value
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} type=${this.type} "${this.value}">`
  }
}
