import { expect, describe, it } from 'vitest'
import { DiskIndexRepository } from './DiskIndexRepository.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'

it('main #story', async () => {
  let sut = new DiskIndexRepository()
  sut.dbFile = '/app/.config/db.json'
  let fs = LocalFileSystemMock.fromFake({
    '/app/.config': '',
    '/app/one/index.md': '',
  })
  sut.fs = fs
  await sut.load()

  let f1 = ActiveFile.create({ path: '/app/one/index.md', fs: fs.raw })
  let f2 = ActiveFile.create({ path: '/app/two/index.md', fs: fs.raw })

  let uid = 'e09636d-c2e4-47c6-a60c-62af650a6147'
  sut.upsert({ file: f1, uid })
  expect(f1.issues.length).toBe(0)

  sut.upsert({ file: f2, uid })
  expect(f2.issues.length).toBe(1)

  // moved file
  await fs.mv('/app/one/index.md', '/app/one/other.md')
  f1.path = '/app/one/other.md'
  sut.upsert({ file: f1, uid })

  //
  expect(Object.keys(sut.model.uids).length).toBe(1)

  // save
  await sut.save()
  let doc = await sut.fs.read<any>(sut.dbFile)
  expect(doc.json.uids[uid].path).toBe('/app/one/other.md')
})
