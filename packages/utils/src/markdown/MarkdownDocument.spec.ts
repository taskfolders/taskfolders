import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from './MarkdownDocument.js'
import { dedent } from '../native/string/dedent.js'
import { readFileSync } from 'node:fs'

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

class StandardTaskFolderFrontmatter {
  uid
  type
  scripts?: { run: string; describe?: string; alias?: string }[]
  review?
  before?
  status?

  static fromJSON(doc) {
    let obj = new this()
    Object.assign(obj, doc)

    let scripts = doc.scripts
    if (scripts) {
      let target = {} as StandardTaskFolderFrontmatter['scripts']
      Object.entries(scripts).forEach(([key, value]) => {
        if (typeof value === 'string') {
          target[key] = { run: value }
        } else {
          target[key] = value
        }
      })
      obj.scripts = target
      console.log({ target })
    }

    return obj
  }
}

it.only('x', async () => {
  let sut = StandardTaskFolderFrontmatter.fromJSON({
    scripts: {
      one: 'echo one',
      two: { run: 'echo two' },
    },
  })

  console.log(sut)
})
