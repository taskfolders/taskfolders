import { expect, describe, it } from 'vitest'
import { findWorkspaceUp } from '../../findWorkspaceUp.js'
import { findWorkspaceForPath } from './findWorkspaceForPath.js'

import Path from 'node:path'
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
        this.bySID[item.sid] = item
      }
    }
  }

  findReference(ref: string) {
    let found = this.byUID[ref]
    if (found) return found

    found = this.bySID[ref]
    if (found) return found
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
      // if (first.sid === 'finance-app') {
      //   console.log({ first, x: { ...item }, sid: item.sid })
      //   // return
      // }
      acuPathItems.push(item)
    }
  }

  sut.add(acuPathItems)
  return sut
}

it('x #live', async () => {
  let sut = await fetchGlobalIndex()
  let item = sut.findReference('tv-shows')
  expect(item.pathRelative).toContain('tv-shows/index.md')
})

it('x #focus #live', async () => {
  let dir = Path.join(process.env.HOME, 'work/fgo/demo')

  let sut = await findWorkspaceForPath(dir)
  // let sut = await findUpWorkspace(dir)
  $dev(sut)
})
