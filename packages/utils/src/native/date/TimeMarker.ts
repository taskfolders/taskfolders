/**
 *  DOC https://en.wikipedia.org/wiki/ISO_8601
 */

import {
  addDays,
  addMonths,
  addWeeks,
  isAfter,
  isValid,
  parse,
  setISOWeek,
  startOfISOWeek,
  startOfMonth,
} from 'date-fns'
import { SortDirection } from '../array/createSort.js'
//import { DateFormat } from './format/DateFormat'
import { TimeService } from './TimeService.js'
import { toJustDateISO, toMonth, weekISO } from './helpers.draft.js'

export type TimeMarkerNames = 'after' | 'before' | 'review'

const createSort =
  (direction: SortDirection = 'ascending') =>
  (t1: TimeMarker, t2: TimeMarker) => {
    let lhs: Date, rhs: Date
    if (direction === 'ascending') {
      // if (!t1) return +1
      // if (!t2) return -1

      lhs = t1?.date({ unsafe: true })
      rhs = t2?.date({ unsafe: true })

      // TODO drop? for Marker(null)
      if (!lhs) return +1
      if (!rhs) return -1
    } else {
      // if (!t1) return -1
      // if (!t2) return +1

      lhs = t2?.date({ unsafe: true })
      rhs = t1?.date({ unsafe: true })

      // TODO drop? for Marker(null)
      if (!lhs) return -1
      if (!rhs) return +1
    }

    return lhs.getTime() - rhs.getTime()
  }

function yearNowLastDigits() {
  // return TimeService.now().getFullYear().toString().slice(-2)
}

let looksLikeRelative = x =>
  x.match(/^(?<direction>[+-])?(?<amount>\d+)(?<term>[wmd])$/)

type TimeMarkerType = 'id' | 'date' | 'relative' | 'invalid'

export class TimeMarker {
  private _isReady: boolean
  isSid: boolean
  isId: boolean
  uid?: string

  get isReady() {
    if (this._isReady === undefined) {
      // $dev(this)
      throw Error('unclear time marker ready status')
    }
    return this._isReady
  }

  static ensure(thing) {
    if (!thing) return thing
    // if (thing instanceof TimeMarker) return marker
    return this.from(thing)
  }

  static sort = createSort

  static isValid(txt: string): boolean {
    let obj = this.from(txt)
    // $dev(obj)
    return obj.isSanitized
  }

  _invalid: boolean
  given: string
  // readonly final: string
  final: string
  _setFinal(s: string, ready: boolean) {
    // @ ts-expect-error
    this.final = s
    this._isReady = ready
  }

  isMilestone = false
  _time: Date

  isValid() {
    return !this._invalid
  }

  _type: TimeMarkerType
  get type(): TimeMarkerType {
    if (this._type) return this._type
    if (this._invalid) return 'invalid'
    if (this.isId) return 'id'
    if (this.date) return 'date'
    return 'invalid'
  }

  now() {
    // let now = TimeService.now()
    return new Date()
  }

  isActive() {
    if (!this.final) return true
    if (this._invalid) return true
    let obj = this
    let tmp = obj.final.toString()
    let time = this.date()
    if (time) {
      let now = this.now()
      // let year = tmp.slice(0, 2)
      // let week = tmp.slice(-2)
      // let year_int = parse(year, 'yy', now).getFullYear()
      // let base = new Date(year_int, 1, 1)
      // let afterThreshold = setISOWeek(base, week)

      return isAfter(now, this._time)
    } else {
      throw Error(`Invalid TimeMarker "${tmp}"`)
    }
  }

  get isSanitized() {
    return this.given !== this.final
  }

  static sanitize(thing) {
    if (!thing) return thing
    return this.from(thing).final
  }

  static from(thing, kv: { now?: Date; baseDate?: Date } = {}): TimeMarker {
    let obj = new this()
    if (typeof thing === 'number') {
      thing = thing.toString()
    }
    if (typeof thing !== 'string') {
      throw Error(`Unexpected time marker input :${thing}`)
    }
    obj.given = thing
    if (!thing) {
      return obj
    }

    let text = thing.toString()
    let now = kv.baseDate ?? kv.now ?? obj.now()
    let thisYear = now.getFullYear().toString()
    // if (type === 'number') {
    //   if (text < 100) {
    //     let next = yearNowLastDigits() + text
    //     let week_n = parseInt(text)
    //     obj.final = `${thisYear}-W${text}`
    //     obj._time = startOfISOWeek(setISOWeek(new Date(), week_n))
    //   } else {
    //     obj.final = text
    //   }
    // }

    if (text.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
      obj._setFinal(text, true)
      // obj._time = new Date(thing)
      obj._isReady = true
      obj._time = parse(text, 'yyyy-LL-dd', now)
    } else if (text.includes('-')) {
      obj._setFinal(text, true)
      let [lhs, rhs] = text.split('-')
      if (/[wmW]\d+/.test(rhs)) {
        // https://en.wikipedia.org/wiki/ISO_8601#Week_dates
        let key = rhs[0]
        let word = rhs.slice(1)
        if (word.length < 2) {
          let wordNext = word.padStart(2, '0')
          let final = obj.final.replace(`-${key}${word}`, `-${key}${wordNext}`)
          obj._setFinal(final, true)
        }
        if (key === 'w') {
          key = 'W'
          obj._setFinal(obj.final.replace('-w', '-W'), true)
        }
        switch (key) {
          case 'W': {
            obj._isReady = true
            obj._time = startOfISOWeek(
              setISOWeek(new Date(`${lhs}-02-01`), parseInt(word)),
            )
            break
          }
          default:
            throw Error('todo')
        }
      } else {
        let parts = text.split('-')
        let [first, second] = parts
        first = first.toLowerCase()
        if (first.length === 3) {
          let en = {
            month_names: [
              'january',
              'february',
              'march',
              'april',
              'may',
              'june',
              'july',
              'august',
              'september',
              'october',
              'november',
              'december',
            ],
            month_names_short: [
              'jan',
              'feb',
              'mar',
              'apr',
              'may',
              'jun',
              'jul',
              'aug',
              'sep',
              'oct',
              'nov',
              'dec',
            ],
          }
          const zip = (a, b) => a.map((k, i) => [k, b[i]])
          let mapShortToLongMonth = Object.fromEntries(
            zip(en.month_names_short, en.month_names),
          )
          first = mapShortToLongMonth[first]
          // TODO:relative
          // $dev(first)
        }

        if (parts.length === 2) {
          let date = parse(text, 'yyyy-MMMM', now)
          if (isValid(date)) {
            obj._setFinal(text, true)
            obj._time = date
          } else {
            if (text.match(/^\d/)) {
              obj._invalid = true
              obj._setFinal(text, false)
            } else {
              obj.isId = true
              obj._setFinal(text, true)
            }
          }
        }
      }
    } else if (text.match(/\d{4}\.\d{1,2}.\d{1,2}/)) {
      obj._setFinal(text, true)
      // obj._time = new Date(thing)
      obj._time = parse(text, 'yyyy.LL.dd', now)
    } else if (looksLikeRelative(text)) {
      let match = looksLikeRelative(text)
      if (match) {
        let amount = parseInt(match.groups.amount)
        let calendarTerm = match.groups.term
        let next: Date
        switch (calendarTerm) {
          case 'd': {
            next = addDays(now, amount)
            obj._setFinal(toJustDateISO(next), false)
            obj._type = 'relative'
            break
          }

          case 'w': {
            next = addWeeks(now, amount)
            let noSymbol = text.match(/^\d/)
            if (noSymbol) {
              next = startOfISOWeek(next)
            }
            // let week = getISOWeek(now) + amount
            // let week_s = week.toString().padStart(2, '0')
            // obj.final = `${thisYear}/w${week_s}`
            obj._setFinal(toJustDateISO(next), false)
            obj._type = 'relative'
            break
          }
          case 'm': {
            next = addMonths(now, amount)
            obj._setFinal(toJustDateISO(next), false)
            obj._type = 'relative'
            break
          }
          default: {
            throw Error(`Unknown "${calendarTerm}"`)
          }
        }
        obj._time = next
      } else {
        throw Error(`Invalid after mark "${text}"`)
      }
    } else {
      // parse string
      let isEncoded = x => /[wW]\d+$/.test(x)
      let maybeCalendarWord = x => /^[a-zA-Z]+$/.test(x)
      let isNumberStart = x => /^\d+/.test(x)
      if (isEncoded(text)) {
        let key = text[0]
        let word = text.slice(1)
        switch (key) {
          case 'W':
          case 'w': {
            let week_n = parseInt(word)
            obj._time = startOfISOWeek(setISOWeek(now, week_n))
            obj._setFinal(`${thisYear}-W${word.padStart(2, '0')}`, false)
            break
          }
          default:
            // $log.error('Bad after value', { thing })
            obj._invalid = true
            obj.final = text
        }
      } else if (['now', '.', 'today'].includes(text)) {
        let date = now
        // TODO:now
        //let day = DateFormat.from(now).day()
        let day = '-fixme-'
        obj.final = day
        obj._time = date
        obj._isReady = false
      } else if (maybeCalendarWord(text)) {
        let date = parse(text, 'MMMM', now)
        if (isValid(date)) {
          let final = `${thisYear}/${text}`
          obj._setFinal(final, false)
          obj._time = date
          obj._type = 'relative'
        } else {
          // CASE a normal word, assume a :sid
          obj.final = text
          // obj._invalid = true
          obj._isReady = true
          obj._type = 'id'
        }
      } else if (text.startsWith('m/')) {
        // TODO #drop #deprecated #legacy
        obj.final = text.replace('m/', 'milestone/')
        obj._isReady = true
        obj.isMilestone = true
      } else if (text.startsWith('milestone/')) {
        // TODO #drop #deprecated #legacy
        obj.final = text
        obj.isMilestone = true
      } else if (text.match(/\d{4}/)) {
        obj.final = text
        obj._time = new Date(text)
        obj._isReady = true
      } else {
        obj._invalid = true
        obj.final = text
      }
    }

    // normalize to key moments
    let isFullDate = (x: string) => !!x.match(/\d{4}-\d{2}-\d{2}/)

    if (obj._time && obj.final) {
      // month
      let monthStart = startOfMonth(obj._time)
      let isMonthStart = monthStart.getTime() === obj._time.getTime()
      if (isMonthStart) {
        obj.final = toMonth(obj._time)
        // $dev({ a: obj.final })
        // obj._setFinal(toMonth(obj._time), true)
      }

      // week
      // 2021-01-18' -> '2021-W03
      let start = startOfISOWeek(obj._time)
      let isWeekStart = start.getTime() === obj._time.getTime()
      if (isWeekStart && isFullDate(obj.final)) {
        obj.final = weekISO.format(obj._time)
      }
    }

    return obj
  }

  date({ unsafe = false } = {}): Date {
    if (this._time) return this._time
    let date = parse(this.final, 'yyyy-LL-dd', TimeService.now())
    if (!isValid(date)) {
      if (unsafe) return null
      throw Error(`Invalid date ${date}`)
    }
    // assert(isValid(date))
    this._time = date
    return this._time
  }

  distance_DROP(kv = {}) {
    // ST 1
    // let distance = formatDistance(TimeService.now(), this.date())
    // ST 2
    // let distance = DateFormat.from(this.date()).distance(kv)
    // return distance
  }

  replace(type: 'after' | 'before', text: string) {
    let from = `${type}:${this.given}`
    return text.replace(from, `${type}:${this.final}`)
  }

  toJSON() {
    return this.final
  }

  static fromJSON(doc: string) {
    let obj = this.from(doc)
    return obj
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let parts = []
    parts.push(`"${this.final}"`)
    if (this.isValid()) {
      parts.push(this.type)
    } else {
      parts.push('+invalid')
    }
    if (this.isSanitized) {
      parts.push('+sanitized')
    }
    return `<${this.constructor.name} ${parts.join(' ')}>`
  }
}
