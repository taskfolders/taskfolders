import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import dedent from 'dedent'
import { it, expect } from 'vitest'

it('x', () => {
  let doc = MarkdownDocument.fromBody(dedent`
    template: test
    
    # one `)
  let all = MarkdownSections.parse(doc.content)
  let template = {
    sections: ['# one', '# two'],
    frontData: { fields: ['author'] },
  }

  let issues = []
  for (let section of all.all) {
    all
  }
})
