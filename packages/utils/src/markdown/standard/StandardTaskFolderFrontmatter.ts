import { DataModel } from '../../models/DataModel.js'

export class StandardTaskFolderFrontmatter {
  uid
  type: string
  scripts?: { run: string; describe?: string; alias?: string }[]
  review?
  before?
  status?
  static fromJSON(doc) {
    return DataModel.parseSync(this, doc)
  }
}

DataModel.decorate(StandardTaskFolderFrontmatter, {
  type: {
    value: 'https://taskfolders.com/types/markdown/v1',
    field: 'type',
  },
  before(doc) {
    return doc
  },
  properties: {
    scripts: {
      parse(doc) {
        let target = {} as StandardTaskFolderFrontmatter['scripts']
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