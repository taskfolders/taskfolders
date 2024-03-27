import yaml from 'yaml'

export class AppSettings {
  type = 'https://taskfolders.com/docs/config/v1'
  exclude = ['**/.git', '**/node_modules', '**/_data', '**/_build']
  encryption: { recipients: { name: string; type: 'gpg' | 'age' }[] }

  static fromJSON(doc) {
    let obj = new this()
    if (doc.type !== doc.type) {
      throw Error(`Invalid type ${doc.type}, wanted ${obj.type}`)
    }
    Object.assign(obj, doc)
    return obj
  }

  toString() {
    let doc = yaml.stringify(this)
    return doc
  }
}
