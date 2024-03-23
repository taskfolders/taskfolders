import { ScanPathContent } from '../ScanPathContent.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { AppDirs } from '../../../_draft/AppDirs.js'
import { LocalFileSystem } from '@taskfolders/utils/fs'

export async function setup(kv: { disk; debug? }) {
  let dc = new DC()
  let dirs = new AppDirs()
  dirs._config = '/app/.config'
  dc.register(AppDirs, { value: dirs })

  let fs = LocalFileSystemMock.fromFake(kv.disk)
  // TODO dc.mock(LocalFileSystemMock)
  dc.mock(LocalFileSystem, { onCreate: () => fs })

  let sut = await ScanPathContent.create({
    dc,
    params: { path: '/app', convert: true },
  })
  sut.log.screen.debug = kv.debug

  return sut
}

export async function setupAfterScan(kv: { disk; debug? }) {
  let dc = new DC()
  let sut = await setup(kv)
  await sut.execute()
  return sut
}
