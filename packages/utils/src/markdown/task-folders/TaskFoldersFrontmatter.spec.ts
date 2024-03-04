import { expect, describe, it } from 'vitest'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'

it('x', async () => {
  let sut = TaskFoldersFrontmatter.create()
  let doc = JSON.parse(JSON.stringify(sut))
  let s1 = TaskFoldersFrontmatter.fromJSON({ ...doc, tags: 'one,two' })
  let s2 = TaskFoldersFrontmatter.fromJSON({ ...doc, tags: ['a', 'b'] })
  console.log(s1)
})
