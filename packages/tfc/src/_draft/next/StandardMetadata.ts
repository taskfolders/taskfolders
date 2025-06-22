export class StandardMetadata {
  constructor(public _raw) {}

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

  get flags() {
    return [].concat(this._raw.flags ?? this._raw.labels ?? [])
  }

  get review() {
    return this._raw.review
  }

  isParsable() {
    if (!this._raw.type) return true
    return this._raw.type?.includes('taskfolders.com/')
  }
}
