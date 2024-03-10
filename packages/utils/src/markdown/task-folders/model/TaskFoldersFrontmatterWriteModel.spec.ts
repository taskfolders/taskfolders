import { expect, describe, it } from 'vitest'
import { TaskFoldersFrontmatterWriteModel } from './TaskFoldersFrontmatterWriteModel.js'

let toJsonDoc = x => JSON.parse(JSON.stringify(x))

it.skip('x', async () => {
  let sut = TaskFoldersFrontmatterWriteModel.create()
  let doc = toJsonDoc(sut)
  let s1 = TaskFoldersFrontmatterWriteModel.fromJSON({
    ...doc,
    tags: 'one,two',
  })
  let s2 = TaskFoldersFrontmatterWriteModel.fromJSON({
    ...doc,
    tags: ['a', 'b'],
  })
  console.log(s1)
})

it.skip('x sanitize #story', async () => {
  let uid = 'e2a2c6ae-fbb5-49ff-a0f6-de91eb25e10b'
  let sut = TaskFoldersFrontmatterWriteModel.create({ uid })
  let doc = toJsonDoc(sut)
  let s1 = TaskFoldersFrontmatterWriteModel.fromJSON({
    ...doc,
    tags: 'a,b,  c',
    scripts: { one: 'echo one', two: { run: 'echo two' } },
  })

  expect(toJsonDoc(s1)).toEqual({
    type: 'https://taskfolders.com/docs/markdown/v1',
    uid: 'e2a2c6ae-fbb5-49ff-a0f6-de91eb25e10b',
    tags: ['a', 'b', 'c'],
    scripts: { one: { run: 'echo one' }, two: { run: 'echo two' } },
  })
})
