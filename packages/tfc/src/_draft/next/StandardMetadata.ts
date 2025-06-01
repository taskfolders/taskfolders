export class StandardMetadata {
  constructor(public raw) {}

  get type() {
    return this.raw.type
  }

  get uid() {
    return this.raw.uid
  }
  get sid() {
    return this.raw.sid
  }
  get tags() {
    return [].concat(this.raw.tags ?? [])
  }
  get calendar() {
    return [].concat(this.raw.calendar ?? [])
  }

  isParsable() {
    if (!this.raw.type) return true
    return this.raw.type?.includes('taskfolders.com/')
  }
}
