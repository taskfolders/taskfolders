import dedent from 'dedent'
import { expect, describe, it } from 'vitest'
import { toMarkdowns, toTaskFoldersMarkdown } from '../toMarkdowns.js'
import { TaskFoldersFrontmatterWriteModel } from './TaskFoldersFrontmatterWriteModel.js'
import { TaskFoldersFrontmatterViewModel } from './TaskFoldersFrontmatterViewModel.js'

function setup(doc: Partial<TaskFoldersFrontmatterWriteModel>) {
  let model = TaskFoldersFrontmatterWriteModel.fromJSON({
    type: 'tf',
    ...doc,
  })
  let sut = TaskFoldersFrontmatterViewModel.fromWriteModel(model)
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
