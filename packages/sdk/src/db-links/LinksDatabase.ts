import { join } from 'path'
import { readFileSync } from 'fs'

let single: UidDatabase

export class UidDatabase {
  uidsMap: Record<string, string> = {}
  sidsMap: Record<string, string> = {}

  static singleton() {
    if (!single) {
      single = new UidDatabase()
      single.load()
    }
    return single
  }

  //parsePathUids() {
  load() {
    let path = join(process.env.HOME, '.config/TaskFolders.com/db.json')
    let data = JSON.parse(readFileSync(path).toString()) as {
      paths: {
        uid: any
        sid: any
        contentIds: { uids: any }
      }[]
    }

    let uids = {} as any
    let sids = {} as any

    Object.entries(data.paths).map(([path, value]) => {
      uids[value.uid] = path
      if (value.sid) {
        sids[value.sid] = path
      }

      let con = value.contentIds?.uids
      if (con) {
        console.log('TODO')
        // $dev(value)
      }
    })
    this.uidsMap = uids
    this.sidsMap = sids
  }

  findByUid(uid: string) {
    return this.uidsMap[uid]
  }
}
