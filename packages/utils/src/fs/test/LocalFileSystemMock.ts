import { Volume } from 'memfs'
import { LocalFileSystem } from '../LocalFileSystem.js'

export class LocalFileSystemMock extends LocalFileSystem {
  static fromFake(disk: Record<string, any>) {
    let obj = new this()

    let ss = Volume.fromJSON(disk)
    obj.raw = ss as any
    return obj
  }
}
