import { DataModel } from '../../models/DataModel.js'

export class TaskFoldersFrontmatter {
  uid
  type: string
  scripts?: { run: string; describe?: string; alias?: string }[]
  review?
  before?
  status?
  static fromJSON(doc) {
    return DataModel.fromJSON(this, doc)
  }
}

DataModel.decorate(TaskFoldersFrontmatter, {
  type: {
    value: 'https://taskfolders.com/types/markdown/v1',
    field: 'type',
  },
  before(doc) {
    return doc
  },
  properties: {
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
