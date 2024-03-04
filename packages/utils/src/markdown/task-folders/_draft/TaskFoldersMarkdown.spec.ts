import { expect, describe, it } from 'vitest'
import { TaskFoldersMarkdown } from './TaskFoldersMarkdown.js'
import { dedent } from '../../../native/string/dedent.js'
import { MarkdownDocument } from '../../MarkdownDocument.js'
import { TaskFoldersFrontmatter } from '../TaskFoldersFrontmatter.js'

const SUT = TaskFoldersMarkdown

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
  let res = await TaskFoldersMarkdown.fromBody(dedent`
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
    let r1 = await SUT.fromBodyMaybe(dedent`
    ---
    type: https://taskfolders.com/types/markdown/v1
    ---`)
    let r2 = await SUT.fromBodyMaybe(dedent`
    type: https://taskfolders.com/types/markdown/v1
    `)
    let r3 = await SUT.fromBodyMaybe(dedent`
    ---
    type: tf
    ---`)
    let r4 = await SUT.fromBodyMaybe(dedent`
    ---
    type: alien
    ---`)
    let r5 = await SUT.fromBodyMaybe('hello')
    console.log(r2)
  })

  it('x', async () => {
    let r1 = await SUT.fromBodyMaybe(dedent`
    ---
    type: alien
    ---`)
    let r2 = await SUT.fromBodyMaybe(dedent`
    ---
    type: ${TaskFoldersFrontmatter.type}
    title: one
    ---`)
    expect(r1).toBe(null)
    if (!r2) throw Error('boom')
    expect(r2.data.title).toBe('one')
    console.log(r2)
  })

  it.skip('x', async () => {
    let res = await SUT.fromBody(dedent`
    ---
    type: alien
    ---`)
  })
})
