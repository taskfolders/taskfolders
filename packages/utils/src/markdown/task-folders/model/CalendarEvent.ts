import { Temporal } from 'temporal-polyfill'

export class CalendarEvent {
  date: Temporal.PlainDate
  title: string
  tags: string[]
  recurrence: { frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY'; interval: number }
  static fromJSON(doc) {
    let obj = new this()
    Object.assign(obj, doc)
    obj.date = Temporal.PlainDate.from(doc.date)
    return obj
  }
}
