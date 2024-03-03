import { expect, describe, it } from 'vitest'
import { StandardMarkdownDocument } from './StandardMarkdownDocument.js'
import { dedent } from '../../native/string/dedent.js'

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
