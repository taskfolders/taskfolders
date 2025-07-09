import { MarkdownDocument } from '@taskfolders/utils/markdown'
import dedent from 'dedent'
import { expect, describe, it } from 'vitest'
import { parseMarkdownSections } from './parseMarkdownSections.js'
import { log } from 'console'

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

  let res = await parseMarkdownSections(md)
  expect(res[0].type).toBe('todo')
  expect(res[1].type).toBe('todo')
  expect(res[2].type).toBe('todo')
  expect(res[2].title).toBe('Panda')
  expect(res[2].lineNumber).toBe(15)
  expect(res[3].type).toBe('todo')
})

it('x', async () => {
  let body = dedent`
    sid: demo-one
    after: 3w

    hello

    # Some section
    - [ ] action 1
    - [x] action 2

    # TODO random stuff
  `
  let md = await MarkdownDocument.fromBody<any>(body, {
    implicitFrontmatter: true,
  })

  let res = await parseMarkdownSections(md)
  expect(res[0].lineNumber).toBe(6)
  expect(res[1].lineNumber).toBe(10)
})
