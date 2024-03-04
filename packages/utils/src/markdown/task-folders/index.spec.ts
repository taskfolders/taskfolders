import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'
import dedent from 'dedent'

async function toMarkdowns(body: string) {
  let md = await MarkdownDocument.fromBody<any>(body)
  let standard: MarkdownDocument<TaskFoldersFrontmatter>
  try {
    let data = TaskFoldersFrontmatter.fromJSON(md.data)
    md.setData(data)
    standard = md
  } catch (e) {
    //
  }
  return { markdown: md, standard }
}

it('x', async () => {
  let b1 = dedent`
    ---
    type: alien
    ---`
  let b2 = dedent`
    ---
    type: ${TaskFoldersFrontmatter.type}
    title: one
    ---`

  let r1 = await toMarkdowns(b1)
  expect(r1.markdown.data.type).toBe('alien')
  expect(r1.standard).toBeUndefined()

  let r2 = await toMarkdowns(b2)
  expect(r2.markdown.data.title).toBe('one')
  expect(r2.standard.data.title).toBe('one')
})
