import { toDate } from './toDate.js'
import { FlagKey } from './summary/PathItem.js'
import { isBlank } from './index/isBlank.js'
import { NodeLogger } from '../logger/NodeLogger.js'
import { isDate, isValid } from 'date-fns'
import { TimeMarker } from '@taskfolders/utils/native/date/TimeMarker'
import { inspect } from 'node:util'
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
  _now: Date
  readonly uid: string
  readonly sid: string
  readonly type: string
  readonly title: string
  readonly done: boolean
  readonly review: { next: Date; last: Date }

  readonly exclude: string[] = []
  readonly recipients: string[]

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

  // flags: FlagKey[]
  get flags(): FlagKey[] {
    // TODO review allowing singular
    return ensureWords(this._raw.flags ?? this._raw.flag)
  }
  set flags(value: FlagKey[]) {
    this._raw.flags = value
  }

  get tags(): readonly string[] {
    let out = ensureWords(this._raw.tags)
    return out
  }

  set tags(value: string[]) {
    this._raw.tags = value
  }

  constructor(public _raw: Record<string, any>, kv?: { now?: Date }) {
    this._now = kv?.now ?? new Date()
    _raw ??= {}
    this._raw = _raw
    if (_raw.review) {
      this.review = _raw.review
      // this.review.next = toDate(_raw.review.next)
    }
    // this.tags = ensureWords(_raw.tags)

    if (_raw.exclude) {
      this.exclude = [].concat(_raw.exclude)
    }

    if (_raw.recipients) {
      this.recipients = [].concat(_raw.recipients)
    }

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) {
          let res = Reflect.get(target, prop, receiver)
          if (res) return res
        }
        if (prop in target._raw) {
          return (
            // @ts-expect-error TODO
            target._raw[prop]
          )
        }
        return undefined
      },
      has(target, prop) {
        return prop in target || prop in target._raw
      },
      ownKeys(target) {
        const targetKeys = Reflect.ownKeys(target)
        const rawKeys = Reflect.ownKeys(target._raw)
        return Array.from(new Set([...targetKeys, ...rawKeys]))
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop in target) {
          return Object.getOwnPropertyDescriptor(target, prop)
        }
        if (prop in target._raw) {
          return Object.getOwnPropertyDescriptor(target._raw, prop)
        }
        return undefined
      },
    })
  }

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

  get after_v2() {
    let val = this._raw.after_v2
    if (!val) return undefined
    return TimeMark.fromValue(val)
  }

  get before() {
    let val = this._raw.before
    if (!val) return val
    return toDate(val.toString())
  }

  get before_v2() {
    let val = this._raw.before_v2
    if (!val) return undefined
    return TimeMark.fromValue(val)
  }

  get focus(): TimeMark {
    let val = this._raw.focus
    if (!val) return undefined
    val = val.toString()
    let type: TimeMark['type']
    if (/\d{1,2}/.test(val)) {
      let year = this._now.getUTCFullYear()
      val = `${year}-W${val}`
      type = 'relative'
    }
    let res = TimeMark.fromValue(val)
    if (type) {
      res.type = type
    }
    return res
  }

  static fromJSON(doc) {
    return new this(doc)
  }

  get calendar() {
    return [].concat(this._raw.calendar ?? [])
  }

  toJSON() {
    let copy = { ...this._raw } as any

    // for (let key in this) {
    //   if (key.startsWith('_')) continue
    //   let value = this[key]
    //   if (isBlank(value)) continue

    //   copy[key] = value
    // }
    return copy
  }

  // TODO wrong? keep?
  isParsable() {
    if (!this._raw.type) return true
    return this._raw.type?.includes('taskfolders.com/')
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, options) {
    let json = this.toJSON()
    return `${this.constructor.name} ${inspect(json, options)}`
  }
}

export function ensureWords(thing) {
  let val = thing ?? []
  if (typeof val === 'string') {
    val = val.split(',').map(x => x.trim())
  }
  return val
}
