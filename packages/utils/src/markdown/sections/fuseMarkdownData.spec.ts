import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from '../MarkdownDocument.js'
import dedent from 'dedent'
import { fuseMarkdownData } from './fuseMarkdownData.js'

it('x', async () => {
  let md = await MarkdownDocument.fromBody<any>(dedent`
      ---
      fox: 1
      ---
        
      # one
      id: first
      delta: 123
      
      # two
      id: second
      tango: fox
    `)

  let res = await fuseMarkdownData(md)
  expect(res.fox).toBe(1)
  expect(res.first.delta).toBe(123)
  expect(res.second.tango).toBe('fox')
})
