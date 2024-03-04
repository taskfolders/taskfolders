import { expect, describe, it } from 'vitest'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'

it.skip('x', async () => {
  let sut = TaskFoldersFrontmatter.create()
  let doc = JSON.parse(JSON.stringify(sut))
  let s1 = TaskFoldersFrontmatter.fromJSON({ ...doc, tags: 'one,two' })
  let s2 = TaskFoldersFrontmatter.fromJSON({ ...doc, tags: ['a', 'b'] })
  console.log(s1)
})

it('x', async () => {
  let sut = TaskFoldersFrontmatter.create()
  let doc = JSON.parse(JSON.stringify(sut))
  let s1 = TaskFoldersFrontmatter.fromJSON({
    ...doc,
    scripts: { one: 'echo one', two: { run: 'echo two' } },
  })

  expect(s1.scripts.one.run).toBe('echo one')
  expect(s1.scripts.two.run).toBe('echo two')
  console.log(JSON.parse(JSON.stringify(s1)))
})
