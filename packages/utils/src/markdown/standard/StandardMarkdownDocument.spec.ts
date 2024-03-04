import { expect, describe, it } from 'vitest'
import { StandardMarkdownDocument } from './StandardMarkdownDocument.js'
import { dedent } from '../../native/string/dedent.js'
import { MarkdownDocument } from '../MarkdownDocument.js'
import { StandardTaskFolderFrontmatter } from './StandardTaskFolderFrontmatter.js'

const SUT = StandardMarkdownDocument

function tryStandardClone(
  md: MarkdownDocument,
): MarkdownDocument<StandardTaskFolderFrontmatter> {
  try {
    let r1 = md.clone()
    r1.data = StandardTaskFolderFrontmatter.fromJSON(r1.data)
    return r1 as MarkdownDocument<StandardTaskFolderFrontmatter>
  } catch (e) {
    return null
  }
}

it('x', async () => {
  let res = await StandardMarkdownDocument.fromBody(dedent`
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

it.only('infer Standard Markdown', async () => {
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

  console.log(r2)
})
