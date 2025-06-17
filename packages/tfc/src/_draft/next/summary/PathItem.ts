import { join } from 'path/posix'

export class PathItem {
  // pathRelative
  get pathFull() {
    return join(this.base, this.path)
  }
  path
  dir
  show
  base
  mtime: Date
}
