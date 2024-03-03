import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from './MarkdownDocument.js'
import { dedent } from '../native/string/dedent.js'

it('x #now #tmp', async () => {
  let res = await MarkdownDocument.fromBody(dedent`
      ---
      fox: 1
      ---

      more`)

  expect(res.data).toEqual({ fox: 1 })
  expect(res.content).toEqual('\nmore')
})
