import { Temporal } from 'temporal-polyfill'
import { ensureWords } from './ensureWords.js'

export class CalendarEvent {
  date: Temporal.PlainDate
  title: string
  tags: string[]
  recurrence: { frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY'; interval: number }
  static fromJSON(doc) {
    let obj = new this()
    Object.assign(obj, doc)
    obj.date = Temporal.PlainDate.from(doc.date)
    obj.tags = ensureWords(doc.tags)
    return obj
  }
}
