import * as fs from 'fs'
import * as Path from 'node:path'

export class JsonFile<T> {
  path: string
  data: T

  get body() {
    return JSON.stringify(this.data)
  }

  static readUnsafe<T>(aPath: string | string[]) {
    let path = Path.join(...[].concat(aPath))
    if (!fs.existsSync(path)) return null
    let obj = new this<T>()
    obj.path = path
    obj.data = JSON.parse(fs.readFileSync(path).toString())
    return obj
  }
}
