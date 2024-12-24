import dedent from 'dedent'
import { expect, describe, it } from 'vitest'
import { TaskFoldersFrontmatterWriteModel } from './WriteModel.js'
import { TaskFoldersFrontmatterReadModel } from './ReadModel.js'
import { $dev } from '@taskfolders/utils/logger'
import { CalendarEvent } from './CalendarEvent.js'

function setup(doc: Partial<TaskFoldersFrontmatterWriteModel>) {
  let model = TaskFoldersFrontmatterWriteModel.fromJSON({
    type: 'tf',
    ...doc,
  })
  let sut = TaskFoldersFrontmatterReadModel.fromWriteModel(model)
  return sut
}

it('default values', async () => {
  let sut = setup({
    title: 'one',
  })
  expect(sut.title).toBe('one')
  expect(sut.tags).toEqual([])
  expect(sut.scripts).toEqual({})
  expect(sut.exclude).toEqual([])
  // console.dir(res)
})

it('x', async () => {
  let sut = setup({
    tags: 'a,  b',
    scripts: {
      one: 'echo one',
      two: { run: 'echo two' },
    },
  })

  expect(sut.tags).toEqual(['a', 'b'])
  expect(sut.scripts.one.run).toEqual('echo one')

  let doc = JSON.parse(JSON.stringify(sut))
  expect(doc.tags).toBe('a,  b')
  expect(doc.scripts.one).toBe('echo one')
})

it('x #story', async () => {
  // exclude
  expect(setup({ exclude: true }).exclude).toEqual(['.'])
  expect(setup({ exclude: ['build'] }).exclude).toEqual(['build'])
  expect(setup({}).exclude).toEqual([])
})

it('x', async () => {
  let sut = setup({
    sid: 'learn-tf',
    flags: 'workspace',
    review: '2024-01-01',
    calendar: [
      {
        date: '2024-01-01',
        title: 'deliver fox',
        tags: 'payment',
      },
      {
        date: '2024-02-01',
        title: 'tango',
        recurrence: {
          frequency: 'MONTHLY',
          interval: 1,
        },
      },
    ],
  })

  expect(sut.flags).toEqual(['workspace'])
  let cal = CalendarEvent.fromJSON(sut.calendar[0])
})
