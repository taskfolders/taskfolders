import { DataModel } from '../../models/DataModel.js'

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

export class TaskFoldersFrontmatter {
  _meta = {
    input: null,
    issues: null,
  }

  static type = TYPE
  type = TYPE
  uid
  title: string
  scripts?: Record<string, { run: string; describe?: string; alias?: string }>
  review?
  before?
  status?
  tags?: string[]

  static fromJSON(doc) {
    return DataModel.fromJSON(this, doc)
  }

  static create(kv: { uid?: string } = {}) {
    let obj = new this()
    obj.uid = kv.uid ?? crypto.randomUUID()
    return obj
  }

  toJSON() {
    let copy = { ...this }
    delete copy._meta

    for (let key of Object.keys(copy)) {
      isEmpty
    }
    return copy
  }
}

DataModel.decorate(TaskFoldersFrontmatter, {
  type: {
    value: TYPE,
    field: 'type',
  },
  before(doc) {
    return doc
  },
  properties: {
    tags: {
      // TODO lint
      //  - encourage all lowercase kebab case
      //  - warn about camel case
      parse(ctx) {
        ctx.value = ensureWords(ctx.value)
      },
    },
    scripts: {
      fromJSON(doc) {
        let target = {} as TaskFoldersFrontmatter['scripts']
        Object.entries<any>(doc).forEach(([key, value]) => {
          if (typeof value === 'string') {
            target[key] = { run: value }
          } else {
            target[key] = value
          }
        })
        return target
      },
    },
  },
})
