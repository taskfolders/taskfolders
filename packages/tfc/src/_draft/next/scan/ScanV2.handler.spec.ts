import { expect, describe, it } from 'vitest'
import { ScanV2Handler } from './ScanV2.handler.js'
import { join } from 'path'
import { Folder } from '../Folder.js'
import { WorkspaceIndex } from '../index/WorkspaceIndex.js'
import { memoryFilesystem } from '../summary/memoryFilesystem.js'

it('scan all #scaffold', async () => {
  let cwd = join(process.env.HOME, 'work/fgo')
  let sut = new ScanV2Handler({ dir: cwd })
  await sut.execute()
})

it('scan a single file #scaffold', async () => {
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
  sut.wsIndex = index
  // TODO better source? in execute
  sut.wsIndex.pathBaseDir = cwd
  await sut._scanOneFile(item.file, item.folder, item.folders)
  console.log(sut.wsIndex.data)
})

describe('exclude', () => {
  it('exclude #sample', async () => {
    let cwd = join(__dirname, '_test/exclude-1')
    let sut = new ScanV2Handler({ dir: cwd })
    await sut.execute()
  })

  it('exclude 2 #sample', async () => {
    let cwd = join(__dirname, '_test/exclude-2')
    let sut = new ScanV2Handler({ dir: cwd })
    await sut.execute()
    expect(Object.keys(sut.wsIndex.data.paths).length).toBe(1)
  })
})

it.only('x in memory test', async () => {
  let sut = new ScanV2Handler({ dir: '/app' })
  sut.fs = memoryFilesystem({
    '/app/index.md': 'flags: workspace',
    '/app/action/now/ikea.md': 'flags: now\n\nhi',
    '/app/action/now/second.md': '',
    '/app/action/now/doctor/index.md': '',
    '/app/action/now/doctor/blood-test.md': '',
    '/app/action/now/hike/nested/index.md': '',
    '/app/projects/india/action/now/plan.md': 'fox: 1',
    '/app/action/alien/index.md': '',
  })

  await sut.execute()
  $dev(sut.wsIndex)
})
