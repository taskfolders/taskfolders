//import { UUID } from '@taskfolders/core/uids'
// import { OmitFunctions } from '@taskfolders/core/types'
//import { SmartDate } from '@taskfolders/core/native/date/SmartDate'
import { isUUID } from '@taskfolders/utils/regex/isUUID'
function isEmpty(obj) {
  return Object.keys(obj).length === 0
}
export type CalendarEventType =
  | 'before'
  | 'after'
  | 'calendar'
  // TODO #review here or out?
  | 'review'

export interface IEvent {
  type: CalendarEventType

  date?: Date
  sDate?: any
  // sDate?: SmartDate
  time?: string
  line?: number
  title?: string
  data?
}

export class IndexMeta {
  uid: string
  sid: string
  tid
  path: string

  contentIds: {
    sid?
    uid?
  }

  title: string

  tags: string[]
  inode: number
  mtime: Date
  backLinks: string[]
  events: IEvent[]
  sections: Record<number, { uid?; sid?; lineNumber? }>
  wip?: boolean

  setOnSection(index: number, kv) {
    this.sections ??= {}
    this.sections[index] = { ...this.sections[index], ...kv }
  }

  type: string
  tasks?: { topic: string; topicId: string; lineNumber: number; line: string }[]

  // TODO rename .localLinks #rf
  localFiles: { path: string; inode }[]

  // static create(doc: OmitFunctions<IndexMeta>)
  static create(doc: Partial<IndexMeta>) {
    let obj = new this()
    if (doc.uid) {
      if (!isUUID(doc.uid)) {
        throw Error(`Invalid uid :${doc.uid}`)
      }
    }
    Object.assign(obj, doc)
    return obj
  }

  /** @deprecated */
  addEvent(ev: IEvent) {
    // $dev('add ev..', ev.time)
    // $dev.trace()
    this.events ??= []
    this.events.push(ev)
  }

  /** @deprecated */
  addBacklink(uid: string) {
    this.backLinks ??= []
    if (this.backLinks.includes(uid)) return

    // TODO #review drop?
    if (!uid) {
      throw Error('No uid given!')
    }
    this.backLinks.push(uid)
  }

  toJSON() {
    let copy = { ...this }
    if (copy.contentIds?.uid?.length === 0) {
      delete copy.contentIds.uid
    }
    if (copy.contentIds?.sid?.length === 0) {
      delete copy.contentIds.sid
    }
    if (isEmpty(copy.contentIds)) delete copy.contentIds
    return copy
  }

  static fromJSON(doc) {
    let obj = new this()
    Object.assign(obj, doc)
    obj.mtime = new Date(doc.mtime)
    if (doc.uid) {
      // obj.uid = UUID.fromJSON(doc.uid)
    }
    return obj
  }
}
