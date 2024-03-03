export class StandardTaskFolderFrontmatter {
  uid
  type
  scripts?: { run: string; describe?: string; alias?: string }[]
  review?
  before?
  status?

  static fromJSON(doc) {
    let obj = new this()
    Object.assign(obj, doc)

    let scripts = doc.scripts
    if (scripts) {
      let target = {} as StandardTaskFolderFrontmatter['scripts']
      Object.entries(scripts).forEach(([key, value]) => {
        if (typeof value === 'string') {
          target[key] = { run: value }
        } else {
          target[key] = value
        }
      })
      obj.scripts = target
    }

    return obj
  }
}
