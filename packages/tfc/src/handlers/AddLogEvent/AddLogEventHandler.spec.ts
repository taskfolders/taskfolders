import { expect, describe, it } from 'vitest'
import { AddLogEventHandler } from './AddLogEventHandler.js'
import { memoryFilesystem } from '../../_draft/next/summary/memoryFilesystem.js'
import { LogRepository } from './LogRepository.js'

it('x', async () => {
  let fs = memoryFilesystem({ '/app': null, '/tmp': null })
  let sut = new AddLogEventHandler({ cwd: '/app', message: 'hello tango=123' })
  sut.fs = fs
  await sut.execute()

  sut = new AddLogEventHandler({ cwd: '/app', message: 'some tango=60' })
  sut.fs = fs
  await sut.execute()

  let repo = LogRepository.from({ cwd: '/app', fs })
  expect(repo.data.logs.length).toBe(2)
  expect(repo.data.logs[0].message).toBe('hello tango=123')
  expect(repo.data.logs[1].message).toBe('some tango=60')
})
