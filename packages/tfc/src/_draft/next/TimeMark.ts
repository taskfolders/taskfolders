export class TimeMark {
  value
  date
  type: 'date' | 'relative' | 'milestone'

  _milestone?: {
    uid?: string
    done: boolean
  }

  static fromValue(x) {
    let obj = new this()
    obj.value = x
    obj.date = new Date(x)
    obj.type = 'date'
    return obj
  }

  isReady() {
    return new Date()
  }
}
