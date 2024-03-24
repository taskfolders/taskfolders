import { expect, describe, it } from 'vitest'
import { DiskIndexRepository } from '../ScanPathContent/disk-index/DiskIndexRepository.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { GetKeyValue } from './GetKeyValue.js'
import dedent from 'dedent'
import { setupAfterScan } from '../ScanPathContent/_test/setup.js'
import { getKeyPath } from './getKeyPath.js'

it('x', async () => {
  let sut = new DiskIndexRepository()
  sut.dbFile = '/app/.config/db.json'
  let fs = LocalFileSystemMock.fromFake({
    '/app/.config': '',
    '/app/one/index.md': '',
  })
  sut.fs = fs
  await sut.load()
  // $dev('todo')
})

it('x #next', async () => {
  let uid = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
  let sut = await setupAfterScan({
    disk: {
      '/app/index.md': dedent`
        ---
        uid: ${uid}
        sid: my-id
        type: tf
        data:
          fox: 1
        ---
        
        foo note
        
        # tango section
        id: tango
        delta: 123
        `,
    },
  })

  let res = sut.disk.findById('my-id')
  let dc = DC.get(sut.disk)
  let sut_2 = dc.fetch(GetKeyValue)
  sut_2.params = { id: 'my-id', query: 'data' }
  let r1 = await sut_2.execute()
  expect(r1).toEqual({ fox: 1 })

  sut_2.params = { id: 'my-id', query: 'tango.delta' }
  let r2 = await sut_2.execute()
  expect(r2).toEqual(123)
})

it.skip('x #live #scaffold', async () => {
  let dc = new DC()
  let sut = dc.fetch(GetKeyValue)
  sut.log.screen.debug = true
  await sut.execute()
})
