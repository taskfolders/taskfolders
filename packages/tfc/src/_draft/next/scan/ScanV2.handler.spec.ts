import { expect, describe, it } from 'vitest'
import { ScanV2Handler } from './ScanV2.handler.js'
import { join } from 'path'
import { Folder } from '../Folder.js'
import { WorkspaceIndex } from '../WorkspaceIndex.js'

it('x #scaffold', async () => {
  let cwd = join(process.env.HOME, 'work/fgo')
  let sut = new ScanV2Handler({ dir: cwd })
  let folder = new Folder(join(cwd, 'scripts/git-sync'))
  let item = {
    file: 'index.md',
    folder,
    folders: [],
  }
  sut.workspace = new Folder(cwd)
  let index = new WorkspaceIndex({ path: '/app' })
  sut.wsIndexData = index
  // TODO better source? in execute
  sut.wsIndexData.pathBaseDir = cwd
  await sut._scanOneFile(item.file, item.folder, item.folders)
  console.log(sut.wsIndexData.data)
})
