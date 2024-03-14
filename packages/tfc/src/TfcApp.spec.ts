import { expect, describe, it } from 'vitest'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { LocalFileSystem } from '@taskfolders/utils/fs'
import { dedent } from '@taskfolders/utils/native/string/dedent'
import { AppDirs } from './_draft/AppDirs.js'
import { TfcApp } from './TfcApp.js'
import { Logger } from '@taskfolders/utils/logger'

async function setup(disk) {
  let dc = new DC()
  let dirs = new AppDirs()
  dirs._config = '/app/.config'
  dc.register(AppDirs, { value: dirs })

  let fs = LocalFileSystemMock.fromFake(disk)
  // TODO dc.mock(LocalFileSystemMock)
  dc.mock(LocalFileSystem, { onCreate: () => fs })

  let sut = new TfcApp()
  //sut.log.screen.debug = true

  return sut
}

describe('command calls', () => {
  it('.scan', async () => {
    let uid = '18189c9d-f6fb-4937-ba1b-ee45a95dd4c9'
    let sut = await setup({
      '/app/index.md': dedent`
        ---
        uid: ${uid}
        type: tf
        workspace: true
        ---`,
      '/app/one/index.md': dedent`
      sid: my-one
    `,
    })

    let log = new Logger()
    log.screen.debug = true

    sut.dc.mock(Logger, {
      onCreate() {
        return log
      },
    })

    await sut.executeCli('scan')
  })

  // BUG using live not virtual
  it('.workspaces #flaw #live', async () => {
    let uid = '18189c9d-f6fb-4937-ba1b-ee45a95dd4c9'
    let sut = await setup({
      '/app/index.md': dedent`
        ---
        uid: ${uid}
        type: tf
        workspace: true
        ---`,
      '/app/one/index.md': dedent`
      sid: my-one
    `,
    })

    let log = new Logger()
    log.screen.debug = true
    sut.dc.mock(Logger, {
      onCreate() {
        return log
      },
    })

    await sut.executeCli('workspaces')
  })
})
