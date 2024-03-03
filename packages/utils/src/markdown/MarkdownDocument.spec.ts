import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from './MarkdownDocument.js'
import { dedent } from '../native/string/dedent.js'
import { readFileSync } from 'node:fs'
import { StandardTaskFolderFrontmatter } from './StandardTaskFolderFrontmatter.js'

it('x #now #tmp', async () => {
  let res = await MarkdownDocument.fromBody(dedent`
      ---
      fox: 1
      ---

      more`)

  expect(res.data).toEqual({ fox: 1 })
  expect(res.content).toEqual('\nmore')
})

it.skip('live file #scaffold', async () => {
  let p = '/home/fgarcia/index.md'
  let body = readFileSync(p).toString()
  let res = await MarkdownDocument.fromBody(body)
  console.log({ res })
})

it.only('x', async () => {
  let sut = StandardTaskFolderFrontmatter.fromJSON({
    scripts: {
      one: 'echo one',
      two: { run: 'echo two' },
    },
  })

  let res = await MarkdownDocument.fromBody(dedent`
      ---
      uid: 2e7f80e2-89c5-4626-9e9d-cfc0082786ec 
      type: https://taskfolders.com/types/markdown/v1
      scripts:
        one: echo one
        two:
          run: echo two
      ---

      more`)

  console.log(res)
})
