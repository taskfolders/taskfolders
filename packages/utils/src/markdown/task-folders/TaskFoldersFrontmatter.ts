import { DataModel } from '../../models/DataModel.js'

const TYPE = 'https://taskfolders.com/types/markdown/v1'

function unique<T>(anArray: T[], { getter = null } = {}): T[] {
  if (!getter) return Array.from(new Set(anArray))
  throw Error('todo')
}

function ensureWords(thing: string | string[]): string[] {
  let words = typeof thing === 'string' ? thing.split(',') : thing
  return words.map(x => x.trim())
}

export class TaskFoldersFrontmatter {
  static type = TYPE
  type = TYPE
  uid
  title: string
  scripts?: { run: string; describe?: string; alias?: string }[]
  review?
  before?
  status?
  tags: string[]

  _input
  _issues

  static fromJSON(doc) {
    return DataModel.fromJSON(this, doc)
  }

  static create() {
    let obj = new this()
    obj.uid = crypto.randomUUID()
    return obj
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
      parse(ctx) {
        ctx.value = ensureWords(ctx.value)
      },
    },
    scripts: {
      fromJSON(doc) {
        let target = {} as TaskFoldersFrontmatter['scripts']
        Object.entries(doc).forEach(([key, value]) => {
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
