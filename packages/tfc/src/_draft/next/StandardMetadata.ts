import { toDate } from './toDate.js'
import { FlagKey } from './summary/PathItem.js'
import { isBlank } from './index/isBlank.js'

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
  flags: FlagKey[]

  review: { next: Date; last: Date }

  exclude: string[] = []
  tags: string[] = []
  recipients: string[]

  constructor(public _raw: Record<string, any>) {
    _raw ??= {}
    if (_raw.review) {
      this.review = _raw.review
      this.review.next = toDate(_raw.review.next)
    }
    this.tags = ensureWords(_raw.tags)

    if (_raw.exclude) {
      this.exclude = [].concat(_raw.exclude)
    }

    this.flags = ensureWords(_raw.flags)
    if (_raw.recipients) {
      this.recipients = [].concat(_raw.recipients)
    }
  }

  get after() {
    let val = this._raw.after
    return toDate(val)
  }

  get before() {
    let val = this._raw.before
    return toDate(val)
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

    for (let key in this) {
      if (key.startsWith('_')) continue
      let value = this[key]
      if (isBlank(value)) continue

      copy[key] = value
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
