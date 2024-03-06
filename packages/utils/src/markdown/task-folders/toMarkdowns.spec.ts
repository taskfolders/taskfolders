import { expect, describe, it } from 'vitest'
import { TaskFoldersFrontmatterWriteModel } from './model/TaskFoldersFrontmatterWriteModel.js'
import dedent from 'dedent'
import { toMarkdowns } from './toMarkdowns.js'
import { isUUID } from '../../regex/isUUID.js'

describe('guess markdown format', () => {
  it('x', async () => {
    let b1 = dedent`
    ---
    type: alien
    ---`
    let b2 = dedent`
    ---
    type: ${TaskFoldersFrontmatterWriteModel.type}
    title: one
    ---`

    let r1 = await toMarkdowns(b1)
    expect(r1.plain.data.type).toBe('alien')
    expect(r1.taskFolder).toBeUndefined()

    let r2 = await toMarkdowns(b2)
    expect(r2.plain.data.title).toBe('one')
    expect(r2.taskFolder.data.title).toBe('one')
    console.log(r2.taskFolder.toString())
  })

  it('implicit frontmatter', async () => {
    let b1 = dedent`
    title: one
    fox
    `
    let res = await toMarkdowns(b1)
    expect(res.plain.data.title).toBe('one')
    expect(res.taskFolder).toBeUndefined()
  })

  it('coerce', async () => {
    let b3 = dedent`
    ---
    title: one
    ---`

    let r1 = await toMarkdowns(b3)
    expect(r1.taskFolder).not.toBeTruthy()

    let r2 = await toMarkdowns(b3, { coerce: true })
    expect(r2.taskFolder).toBeTruthy()
    expect(r2.taskFolder.data.type).toBe(TaskFoldersFrontmatterWriteModel.type)
    expect(isUUID(r2.taskFolder.data.uid)).toBe(true)
  })
})
