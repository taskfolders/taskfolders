import { expect, describe, it } from 'vitest'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'

let toJsonDoc = x => JSON.parse(JSON.stringify(x))

it.skip('x', async () => {
  let sut = TaskFoldersFrontmatter.create()
  let doc = toJsonDoc(sut)
  let s1 = TaskFoldersFrontmatter.fromJSON({ ...doc, tags: 'one,two' })
  let s2 = TaskFoldersFrontmatter.fromJSON({ ...doc, tags: ['a', 'b'] })
  console.log(s1)
})

it('x sanitize #story', async () => {
  let uid = 'e2a2c6ae-fbb5-49ff-a0f6-de91eb25e10b'
  let sut = TaskFoldersFrontmatter.create({ uid })
  let doc = toJsonDoc(sut)
  let s1 = TaskFoldersFrontmatter.fromJSON({
    ...doc,
    tags: 'a,b,  c',
    scripts: { one: 'echo one', two: { run: 'echo two' } },
  })

  expect(s1.scripts.one.run).toBe('echo one')
  expect(s1.scripts.two.run).toBe('echo two')
  expect(toJsonDoc(s1)).toEqual({
    type: 'https://taskfolders.com/types/markdown/v1',
    uid: 'e2a2c6ae-fbb5-49ff-a0f6-de91eb25e10b',
    tags: ['a', 'b', 'c'],
    scripts: { one: { run: 'echo one' }, two: { run: 'echo two' } },
  })
})
