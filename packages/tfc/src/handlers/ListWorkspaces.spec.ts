import { expect, describe, it } from 'vitest'
import { DiskIndexRepository } from './ScanPathContent/disk-index/DiskIndexRepository.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { ListWorkspaces } from './ListWorkspaces.js'

it('x', async () => {
  let sut = new DiskIndexRepository()
  sut.dbFile = '/app/.config/db.json'
  let fs = LocalFileSystemMock.fromFake({
    '/app/.config': '',
    '/app/one/index.md': '',
  })
  sut.fs = fs
  await sut.load()
})

it('x #live #scaffold', async () => {
  let dc = new DC()
  let sut = dc.fetch(ListWorkspaces)
  sut.log.screen.debug = true
  await sut.execute()
})
