import { DataModel } from '../../../models/DataModel.js'

const TYPE = 'https://taskfolders.com/types/markdown/v1'
function isEmpty(obj) {
  return Object.keys(obj).length === 0
}
function unique<T>(anArray: T[], { getter = null } = {}): T[] {
  if (!getter) return Array.from(new Set(anArray))
  throw Error('todo')
}

function ensureWords(thing: string | string[]): string[] {
  let words = typeof thing === 'string' ? thing.split(',') : thing
  return words.map(x => x.trim())
}

export interface ScriptDef {
  run: string
  cwd?: 'cwd' | 'project' | 'root'
  describe?: string
  alias?: string
}

export class TaskFoldersFrontmatterWriteModel {
  // _meta = {
  //   input: null,
  //   issues: null,
  // }

  static type = TYPE
  type = TYPE
  uid = null
  title: string
  scripts?: Record<string, string | ScriptDef>
  review?
  before?
  status?
  tags?: string[] | string
  exclude?: Record<string, string>

  static fromJSON(doc) {
    let md = DataModel.deserialize(this, doc)
    md.uid ??= crypto.randomUUID()
    return md
  }

  static create(kv: { uid?: string } = {}) {
    let obj = new this()
    obj.uid = kv.uid ?? crypto.randomUUID()
    return obj
  }

  toJSON() {
    let copy = { ...this }
    // delete copy._meta

    for (let key of Object.keys(copy)) {
      isEmpty
    }
    return copy
  }
}

DataModel.decorate(TaskFoldersFrontmatterWriteModel, {
  type: {
    value: TYPE,
    field: 'type',
  },
  before(doc) {
    if (doc.type === 'tf') {
      doc.type = TYPE
    }
    return doc
  },
  properties: {
    tags: {
      // TODO lint
      //  - encourage all lowercase kebab case
      //  - warn about camel case
      parse(ctx) {
        //
      },
    },
    scripts: {},
  },
})
