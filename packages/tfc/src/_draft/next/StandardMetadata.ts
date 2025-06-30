import { toDate } from './toDate.js'
import { FlagKey } from './summary/PathItem.js'

export class StandardMetadata {
  flags: FlagKey[]

  review: { next: Date; last: Date }

  after?: Date
  before?: Date
  exclude: string[] = []
  recipients: string[]

  constructor(
    public _raw: Partial<{
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
    }>,
  ) {
    _raw ??= {}
    if (_raw.after) this.after = toDate(_raw.after)
    if (_raw.before) this.before = toDate(_raw.before)
    if (_raw.review) {
      this.review = _raw.review
      this.review.next = toDate(_raw.review.next)
    }

    if (_raw.exclude) {
      this.exclude = [].concat(_raw.exclude)
    }

    this.flags = ensureWords(_raw.flags)
    if (_raw.recipients) {
      this.recipients = [].concat(_raw.recipients)
    }
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
  get tags() {
    return [].concat(this._raw.tags ?? [])
  }
  get calendar() {
    return [].concat(this._raw.calendar ?? [])
  }

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
