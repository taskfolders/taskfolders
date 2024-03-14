import { expect, describe, it } from 'vitest'
import { ActiveFile } from './ActiveFile.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'

it('x', async () => {
  let sut = new ActiveFile()
})

it('main #story', async () => {
  let fs = LocalFileSystemMock.fromFake({ '/foo.txt': 'hi' })
  let sut = ActiveFile.create({ path: '/foo.txt', fs: fs.raw })

  expect(sut.body).toBe('hi')
  expect(sut.stat.isDirectory()).toBe(false)

  expect(sut.read().toString()).toBe('hi')
})
