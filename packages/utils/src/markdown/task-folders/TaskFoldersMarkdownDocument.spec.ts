import { expect, describe, it } from 'vitest'
import { TaskFoldersMarkdownDocument } from './TaskFoldersMarkdownDocument.js'
import { dedent } from '../../native/string/dedent.js'
import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'

const SUT = TaskFoldersMarkdownDocument

function tryStandardClone(
  md: MarkdownDocument,
): MarkdownDocument<TaskFoldersFrontmatter> {
  try {
    let r1 = md.clone()
    r1.data = TaskFoldersFrontmatter.fromJSON(r1.data)
    return r1 as MarkdownDocument<TaskFoldersFrontmatter>
  } catch (e) {
    return null
  }
}

it('x', async () => {
  let res = await TaskFoldersMarkdownDocument.fromBody(dedent`
    ---
    uid: 2e7f80e2-89c5-4626-9e9d-cfc0082786ec 
    type: https://taskfolders.com/types/markdown/v1
    scripts:
      one: echo one
      two:
        run: echo two
    ---

    more`)
})

it('x', async () => {
  let m1 = await MarkdownDocument.fromBody(dedent`
    ---
    uid: 2e7f80e2-89c5-4626-9e9d-cfc0082786ec 
    type: https://taskfolders.com/types/markdown/v1
    ---
    `)
  let m2 = await MarkdownDocument.fromBody(dedent`
    ---
    title: two
    ---
    `)

  let r1 = tryStandardClone(m1)
  let r2 = tryStandardClone(m2)
  expect(r2).toBe(null)
  console.log({ m2, r2 })
})

describe('infer Standard Markdown', async () => {
  it('infer Standard Markdown', async () => {
    let r1 = await SUT.fromBody(dedent`
    ---
    type: https://taskfolders.com/types/markdown/v1
    ---`)
    let r2 = await SUT.fromBody(dedent`
    type: https://taskfolders.com/types/markdown/v1
    `)
    let r3 = await SUT.fromBody(dedent`
    ---
    type: tf
    ---`)
    let r4 = await SUT.fromBody(dedent`
    ---
    type: alien
    ---`)
    let r5 = await SUT.fromBody('hello')
    console.log(r2)
  })

  it.only('x', async () => {
    let res = await SUT.fromBody(dedent`
    ---
    type: alien
    ---`)
  })
})
