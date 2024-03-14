import { expect, describe, it } from 'vitest'
import { AppDirs } from './AppDirs.js'
import { DC } from '@taskfolders/utils/dependencies'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { LocalFileSystem } from '@taskfolders/utils/fs'

it('x', async () => {
  let dc = new DC()
  let fs = LocalFileSystemMock.fromFake({ '/app/': null })
  dc.mock(LocalFileSystem, { onCreate: () => fs })
  let sut = dc.fetch(AppDirs)
  sut.fs = fs
  sut._config = '/app/.config'
  sut.ensure()
  //$dev(fs.lsSync('/app/.config'))
})
