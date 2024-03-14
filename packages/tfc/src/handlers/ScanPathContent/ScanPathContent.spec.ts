import { expect, describe, it } from 'vitest'
import { ScanPathContent } from './ScanPathContent.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { AppDirs } from '../../_draft/AppDirs.js'
import { LocalFileSystem } from '@taskfolders/utils/fs'
import { dedent } from '@taskfolders/utils/native/string/dedent'

async function setup(kv: { disk; debug? }) {
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

it.skip('x #live #scaffold', async () => {
  let dc = new DC()
  let sut = await ScanPathContent.create({
    dc,
    params: { path: '/home/fgarcia/work/action/now/tfc-demo' },
  })
  sut.log.screen.debug = true
  await sut.execute()
})

it('x in-memory #play', async () => {
  // TODO #now see printing? with errors too

  let uid = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
  let uid_sh = '1a922bb9-37be-45a8-b950-4da137957ab1 '
  let uid_yml = '7684b766-c72b-4c13-a61c-23ec325039f2'
  let sut = await setup({
    disk: {
      '/app/index.md': dedent`
        ---
        uid: ${uid}
        type: tf
        workspace: true
        ---`,
      '/app/one/index.md': dedent`
      sid: my-one
    `,
      '/app/one/bogus.md': dedent`
      sid: bogus
      sid: bogus
    `,
      '/app/one/build.sh': dedent`
      # @uid ${uid_sh}
      echo hello
    `,
      '/app/one/config.yml': dedent`
      # @uid ${uid_yml}
      tango: 1
      delta: 2
    `,
      '/app/one/node_modules/alien.md': '',

      '/app/two/index.md': '',
      '/app/two/audio.mp3': '',
    },
  })
  await sut.execute()

  let model = sut.disk.model
  expect(Object.keys(model.uids).length).toBe(5)
  expect(model.workspaces.has(uid)).toBe(true)
  expect(sut.disk.pathForSid('my-one')).toBe('/app/one/index.md')

  // TEST repeated scan on already indexed docs
  await sut.execute()
})

describe('x #draft', () => {
  it('convert to tf', async () => {
    let sut = await setup({
      disk: {
        '/app/index.md': `hello`,
      },
      debug: false,
    })
    sut.params.convert = true
    await sut.execute()
    let after = sut.fs.raw.readFileSync('/app/index.md').toString()
    expect(after).toContain('type: https://taskfolders.com')
    expect(after).toContain('uid: ')
  })
})
