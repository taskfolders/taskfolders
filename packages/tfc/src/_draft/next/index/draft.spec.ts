import { expect, describe, it } from 'vitest'
import { WorkspaceCollections } from '../scan/WorkspaceCollections.js'
import {
  PathIndex,
  pathIndexToPathItem,
  WorkspaceIndex,
} from './WorkspaceIndex.js'
import { Folder } from '../Folder.js'
import { PathItem } from '../summary/PathItem.js'
import { ensureWords } from '../StandardMetadata.js'

class PathItemIndex {
  byPath: Record<string, PathItem> = {}
  byUID: Record<string, PathItem> = {}
  bySID: Record<string, PathItem> = {}

  add(input: PathItem | PathItem[]) {
    let items = [].concat(input) as PathItem[]
    for (let item of items) {
      this.byPath[item.pathFull] = item
      if (item.uid) {
        this.byUID[item.uid] = item
      }
      if (item.sid) {
        this.byUID[item.sid] = item
      }
    }
  }
}

async function fetchGlobalIndex() {
  let wsAll = WorkspaceCollections.request()
  let sut = new PathItemIndex()

  let acuPathItems: PathItem[] = []
  for (let dir of Object.keys(wsAll.data.workspaces)) {
    let ws = new Folder(dir)
    await ws.parse()

    if (!ws.isWorkspace()) {
      throw Error(`Not a workspace ${dir}`)
    }

    let r1 = await WorkspaceIndex.fromDir({
      indexDir: ws.dataDir(),
      baseDir: ws.dir,
    })

    for (let first of r1.data.items) {
      let item = pathIndexToPathItem({
        index: first,
        baseDir: ws.dir,
        wsName: ws.data_std.sid,
      })
      acuPathItems.push(item)
    }
  }

  sut.add(acuPathItems)
  return sut
}

it('x', async () => {
  let res = await fetchGlobalIndex()
  console.log(res)
})
