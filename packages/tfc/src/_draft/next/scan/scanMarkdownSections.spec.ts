import { MarkdownDocument } from '@taskfolders/utils/markdown'
import dedent from 'dedent'
import { expect, describe, it } from 'vitest'
import { scanMarkdownSections } from './scanMarkdownSections.js'

it('x todo', async () => {
  let body = dedent`
    fox: 1
    after: 3w
    
    - [ ] first

    # Section
    
    some tasks

    - [ ] one
    - [x] two

    hi
    
    # Panda
    flags: todo
    
    # TODO some again
  `

  let md = await MarkdownDocument.fromBody<any>(body, {
    implicitFrontmatter: true,
  })

  let res = await scanMarkdownSections(md)
  expect(res[0].type).toBe('todo')
  expect(res[1].type).toBe('todo')
  expect(res[2].type).toBe('todo')
  expect(res[2].title).toBe('Panda')
  expect(res[2].lineNumber).toBe(17)
  expect(res[3].type).toBe('todo')
})
