import fs from 'node:fs'
import { log } from '../../dc.js'
import { createSort } from '@taskfolders/utils/native/array/createSort'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
import { memoryFilesystem } from '../../_draft/next/summary/memoryFilesystem.js'
// src/_draft/next/summary/memoryFilesystem.ts

it.skip('x inboxes', async () => {
  let d1 = join(process.env.HOME, 'Downloads')
  // TODO get from osx env/config? linux?
  let d2 = join(process.env.HOME, 'Downloads/Screenshots')
  let all = fs.readdirSync(d1).map(pathRelative => {
    let pathFull = join(d1, pathRelative)
    let stat = fs.statSync(pathFull)

    return { path: pathRelative, mtime: stat.mtime }
  })
  all.sort(createSort({ key: 'mtime', direction: 'descending' }))
  all = all.filter(x => {
    if (x.path.startsWith('.')) return false
    return true
  })
  all = all.slice(0, 10)

  log.dev(all)
})
import { expect, describe, it } from 'vitest'
import { join } from 'node:path'
import { PullInboxHandler } from './PullInboxHandler.js'

it('x', async () => {
  let sut = new PullInboxHandler({ cwd: '/app' })
  sut.dirs = ['/home/user/Downloads']
  let file = '/home/user/Downloads/file1.txt'
  sut.fs = memoryFilesystem({
    [file]: '',
    '/app/foo': '',
    '/app/_inbox': null,
  })
  sut._select = async () => [file]
  await sut.execute()

  expect(sut.fs.existsSync(file)).toBe(false)
  expect(sut.fs.existsSync('/app/_inbox/file1.txt')).toBe(true)
})
