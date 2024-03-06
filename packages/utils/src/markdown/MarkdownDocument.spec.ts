import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from './MarkdownDocument.js'
import { dedent } from '../native/string/dedent.js'
import { readFileSync } from 'node:fs'
import { TaskFoldersFrontmatterWriteModel } from './task-folders/model/TaskFoldersFrontmatterWriteModel.js'
import { expectType } from '../types/expectType.js'

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

it('x', async () => {
  // let sut = StandardTaskFolderFrontmatter.fromJSON({
  //   scripts: {
  //     one: 'echo one',
  //     two: { run: 'echo two' },
  //   },
  // })

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
  let data = TaskFoldersFrontmatterWriteModel.fromJSON(res.data)
  res.data = data
  console.log(res)
})

it('x #story', async () => {
  let res = await MarkdownDocument.fromBody(
    dedent`
      fox: 1
      more`,
    { implicitFrontmatter: true },
  )

  expect(res.data).toEqual({ fox: 1 })
  expect(res.content).toBe('more')

  class Panda {
    fox: number
    static fromJSON(doc) {
      let obj = new this()
      Object.assign(obj, doc)
      return obj
    }
  }

  let r1 = res.setData(Panda.fromJSON(res.data))
  expectType<typeof r1, MarkdownDocument<Panda>>()
  console.log(r1)
  let txt = r1.toString()
  console.log(txt)
  expect(txt).toBe(dedent`
    ---
    fox: 1
    ---

    more
  `)
})
