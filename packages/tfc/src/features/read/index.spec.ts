import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import dedent from 'dedent'
import { expect, describe, it } from 'vitest'
import { StandardMetadata } from '../../_draft/next/StandardMetadata.js'
import { parseMarkdownSections } from '../../_draft/next/scan/parseMarkdownSections.js'
import { ReadMarkdownHandler } from './ReadMarkdownHandler.js'
import { memoryFilesystem } from '../../_draft/next/summary/memoryFilesystem.js'

let md = dedent`
  ---
  token:
    name: foo
    value: 123
  ---
    
  Some text
  
  # some foo
  label: tango
  
  the text

  # some bar
  delta: 5
`

it('x from file', async () => {
  let sut = new ReadMarkdownHandler({
    reference: 'foo.md',
    jsonPath: '.front.token',
    cwd: '/tmp',
  })
  sut.fs = memoryFilesystem({
    '/tmp/foo.md': md,
  })
  await sut.execute()
})
