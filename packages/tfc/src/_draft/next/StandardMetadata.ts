import { toDate } from './toDate.js'
import { FlagKey } from './summary/PathItem.js'
import { isBlank } from './index/isBlank.js'
import { NodeLogger } from '../logger/NodeLogger.js'
import { isDate, isValid } from 'date-fns'
import { TimeMarker } from '@taskfolders/utils/native/date/TimeMarker'
import { TimeMark } from './TimeMark.js'

const log = new NodeLogger()

type UserInput = {
  uid
  type
  sid
  tags
  before
  after
  calendar
  review
  flags
  labels
  exclude
  recipients: string | string[]
}

export class StandardMetadata {
  static sanitize(doc: UserInput) {
    let issues = []
    const checkDateField = (key: keyof UserInput) => {
      let input = doc[key]

      if (!input) return
      input = input.toString()

      let value = toDate(input)
      if (isValid(value)) return value
      let tm = TimeMarker.from(input)
      if (tm.isValid() && tm._type === 'relative') {
        issues.push({
          field: key,
          value: input,
          code: 'relative-date',
          fix: { value: tm.final },
        })
      } else {
        // TODO label-milestone? sid? VS just plain wrong date?
        // issues.push({ field: 'after', value: input, code: 'invalid' })
      }
    }
    checkDateField('after')
    checkDateField('before')

    let ok = issues.length === 0
    return { ok, issues }
  }

  flags: FlagKey[]
  done: boolean

  review: { next: Date; last: Date }

  exclude: string[] = []
  tags: string[] = []
  recipients: string[]

  constructor(public _raw: Record<string, any>) {
    _raw ??= {}
    if (_raw.review) {
      this.review = _raw.review
      // this.review.next = toDate(_raw.review.next)
    }
    this.tags = ensureWords(_raw.tags)

    if (_raw.exclude) {
      this.exclude = [].concat(_raw.exclude)
    }

    this.flags = ensureWords(_raw.flags)
    if (_raw.recipients) {
      this.recipients = [].concat(_raw.recipients)
    }
    this.done = _raw.done

    if (_raw.after) {
      this.after_v2 = TimeMark.fromValue(_raw.after)
    }
  }

  after_v2: TimeMark

  get after() {
    let val = this._raw.after
    if (!val) return undefined

    if (typeof val !== 'string') {
      // TODO
      log.warn('why stored date??')
      return val
    }
    return toDate(val.toString())
  }

  get before() {
    let val = this._raw.before
    if (!val) return val
    return toDate(val.toString())
  }

  static fromJSON(doc) {
    return new this(doc)
  }

  get type() {
    return this._raw.type
  }

  get uid() {
    return this._raw.uid
  }
  get sid() {
    return this._raw.sid
  }

  get calendar() {
    return [].concat(this._raw.calendar ?? [])
  }

  toJSON() {
    let copy = { ...this._raw } as any

    let myKeys: (keyof StandardMetadata)[] = ['after_v2']

    for (let _key in this) {
      let myKey = _key as keyof StandardMetadata
      if (myKey.startsWith('_')) continue
      if (myKey === 'after_v2') continue

      let value = this[myKey]
      if (isBlank(value)) continue

      copy[myKey] = value
    }
    return copy
  }

  // TODO wrong? keep?
  isParsable() {
    if (!this._raw.type) return true
    return this._raw.type?.includes('taskfolders.com/')
  }
}

export function ensureWords(thing) {
  let val = thing ?? []
  if (typeof val === 'string') {
    val = val.split(',').map(x => x.trim())
  }
  return val
}
