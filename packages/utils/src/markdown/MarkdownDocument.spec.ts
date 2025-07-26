import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from './MarkdownDocument.js'
import { dedent } from '../native/string/dedent.js'
import { readFileSync } from 'node:fs'
import { TaskFoldersFrontmatterWriteModel } from './task-folders/model/WriteModel.js'
import { expectType } from '../types/expectType.js'
import { log } from 'node:console'

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
  // console.log(r1)
  let txt = r1.toString()
  // console.log(txt)
  expect(txt).toBe(dedent`
    fox: 1

    more
  `)
})

it('x bad fm #edge', async () => {
  let res
  let md1 = MarkdownDocument.fromBody(
    dedent`
      ---
      fox: 1
      bar
      --- `,
  )

  // no body
  let md2 = MarkdownDocument.fromBody(dedent`
    ---
    type: foo
    ---`)
  let txt = md2.toString().split('\n')
  expect(txt).toEqual(['---', 'type: foo', '---'])
})

it('x edit md', async () => {
  let body = dedent`
    fox: 1
    
    hi
  `
  let md = await MarkdownDocument.fromBody<{ fox }>(body, {
    implicitFrontmatter: true,
  })
  md.data.fox = 2
  let lines = md.toString().split('\n')

  expect(lines).toEqual(['fox: 2', '', 'hi'])
})

it('convert to string', async () => {
  let body = dedent`
    fox: 1
    
    hi
  `
  let md = await MarkdownDocument.fromBody(body, { implicitFrontmatter: true })
  let after = md.toString()
  expect(body).toBe(after)

  body = dedent`
    ---
    fox: 1
    ---
    
    hi
  `
  md = await MarkdownDocument.fromBody(body, { implicitFrontmatter: true })
  expect(body).toBe(md.toString())
})

// it.only('x', async () => {
//   let body = dedent`
//     fox: 1

//     hi
//   `
//   let md = MarkdownDocument.fromBody(body, { implicitFrontmatter: true })
// })
