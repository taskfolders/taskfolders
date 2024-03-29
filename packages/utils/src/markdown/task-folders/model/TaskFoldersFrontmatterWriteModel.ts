import { DataModel, DataModelError } from '../../../models/DataModel.js'

const TYPE = 'https://taskfolders.com/docs/markdown/v1'

const Type_OLD = 'https://taskfolders.com/docs/markdown'
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
  title?: string
  dir?: 'source' | 'package' | 'cwd'
  describe?: string
  alias?: string
}

/**
 * Model of what you can see written in the frontmatter of a TaskFolders
 * markdown document
 *
 * For a more strict and sanitized version of what a developer use the ViewModel
 * variant
 */
export class TaskFoldersFrontmatterWriteModel {
  // _meta = {
  //   input: null,
  //   issues: null,
  // }

  static type = TYPE
  type = TYPE
  uid: string = undefined
  title: string
  scripts?: Record<string, string | ScriptDef>
  review?
  before?
  status?
  tags?: string[] | string
  exclude?: string[] | true

  static fromJSON(doc) {
    let md = DataModel.deserialize(this, doc)
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
  // type: {
  //   value: TYPE,
  //   field: 'type',
  // },
  before(doc) {
    if (doc.type === TYPE) {
      // OK
    } else if (doc.type === 'tf') {
      doc.type = TYPE
    } else if (doc.type === Type_OLD) {
      //
    } else {
      throw DataModelError.invalidType.create({ wanted: TYPE, given: doc.type })
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
