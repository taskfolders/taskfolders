import { expect, describe, it } from 'vitest'
import { TaskFoldersMarkdown } from './TaskFoldersMarkdown.js'
import { dedent } from '../../native/string/dedent.js'
import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from './model/TaskFoldersFrontmatterWriteModel.js'
import { isUUID } from '../../regex/UUID.js'
import { DataModelError } from '../../models/DataModel.js'
import { readFileSync } from 'node:fs'
import { $dev } from '../../logger/index.js'
const Model = TaskFoldersFrontmatterWriteModel

const SUT = TaskFoldersMarkdown

function tryStandardClone(
  md: MarkdownDocument,
): MarkdownDocument<TaskFoldersFrontmatterWriteModel> {
  try {
    let r1 = md.clone()
    r1.data = TaskFoldersFrontmatterWriteModel.fromJSON(r1.data)
    return r1 as MarkdownDocument<TaskFoldersFrontmatterWriteModel>
  } catch (e) {
    return null
  }
}

it('x', async () => {
  let res = await TaskFoldersMarkdown.fromBody(dedent`
    ---
    uid: 2e7f80e2-89c5-4626-9e9d-cfc0082786ec 
    type: https://taskfolders.com/docs/markdown/v1
    scripts:
      one: echo one
      two:
        run: echo two
    ---

    more`)
})

it('x', async () => {
  let m1 = await MarkdownDocument.fromBody(dedent`
    ---
    uid: 2e7f80e2-89c5-4626-9e9d-cfc0082786ec 
    type: https://taskfolders.com/docs/markdown/v1
    ---
    `)
  let m2 = await MarkdownDocument.fromBody(dedent`
    ---
    title: two
    ---
    `)

  let r1 = tryStandardClone(m1)
  let r2 = tryStandardClone(m2)
  expect(r2).toBe(null)
  console.log({ m2, r2 })
})

describe('infer Standard Markdown', async () => {
  it('infer Standard Markdown', async () => {
    let r1 = await SUT.fromBodyMaybe(dedent`
    ---
    type: https://taskfolders.com/types/markdown/v1
    ---`)
    let r2 = await SUT.fromBodyMaybe(dedent`
    type: https://taskfolders.com/types/markdown/v1
    `)
    let r3 = await SUT.fromBodyMaybe(dedent`
    ---
    type: tf
    ---`)
    let r4 = await SUT.fromBodyMaybe(dedent`
    ---
    type: alien
    ---`)
    let r5 = await SUT.fromBodyMaybe('hello')
    console.log(r2)
  })

  it('x', async () => {
    let r1 = await SUT.fromBodyMaybe(dedent`
    ---
    type: alien
    ---`)
    let r2 = await SUT.fromBodyMaybe(dedent`
    ---
    type: ${TaskFoldersFrontmatterWriteModel.type}
    title: one
    ---`)
    expect(r1).toBe(null)
    if (!r2) throw Error('boom')
    expect(r2.data.title).toBe('one')
    console.log(r2)
  })

  it.skip('x', async () => {
    let res = await SUT.fromBody(dedent`
    ---
    type: alien
    ---`)
  })
})

describe('type field handling', () => {
  it('type upgrade #todo', async () => {
    let b1 = dedent`
    ---
    type: tf  
    ---`
    let r1 = await SUT.fromBody(b1)
    expect(r1.data.type).toBe(Model.type)

    // TODO drop
    let b2 = dedent`
    ---
    type: https://taskfolders.com/docs/markdown
    ---`
    let r2 = await SUT.fromBody(b2)

    // TODO
    // expect(r2.data.type).toBe(Model.type)
  })

  it('coerce and upgrade', async () => {
    let b3 = dedent`
    ---
    title: one
    ---`

    // let r1 = await SUT.parse(b3)
    // expect(r1.taskfolder).not.toBeTruthy()

    let r2 = await SUT.parse(b3, { coerce: true })
    expect(r2.taskfolder).toBeTruthy()
    expect(r2.taskfolder.data.type).toBe(TaskFoldersFrontmatterWriteModel.type)
    expect(isUUID(r2.taskfolder.data.uid)).toBe(true)
  })

  it('foreign types', async () => {
    let b1 = dedent`
    ---
    type: alien
    ---`

    // Do not convert in .parse
    let r1 = await SUT.parse(b1)
    expect(r1.plain.data.type).toBe('alien')
    expect(r1.taskfolder).toBeUndefined()

    // fail in .fromBody
    let r2 = await SUT.fromBody(b1).catch(e => e)
    expect(DataModelError.invalidType.is(r2)).toBe(true)
  })

  it('valid type', async () => {
    let b2 = dedent`
    ---
    type: ${TaskFoldersFrontmatterWriteModel.type}
    title: one
    ---`
    let r2 = await SUT.parse(b2)
    expect(r2.plain.data.title).toBe('one')
    expect(r2.taskfolder.data.title).toBe('one')
    // $dev(r2.taskfolder.toString())
  })
})

describe('x #draft', () => {
  it('implicit frontmatter', async () => {
    let b1 = dedent`
    title: one
    fox
    `
    let res = await SUT.parse(b1)
    expect(res.plain.data.title).toBe('one')
    expect(res.taskfolder).toBeUndefined()
  })

  it('x #todo', async () => {
    let res = await SUT.fromBodyMaybe('hello', { coerce: true })
    let r1 = await SUT.parse('hello', { coerce: true })
    // $dev(r1.taskfolder.toString())
  })

  it('x tf type?', async () => {
    let b2 = dedent`
    ---
    type: tf
    exclude: 
      - one
    ---`
    //let res = await SUT.parse(b2)
    let r2 = await SUT.fromBodyMaybe(b2)
    //$dev(r2)
  })

  it.skip('#scaffold', async () => {
    let path
    let body = readFileSync(path).toString()
    //let res = await SUT.fromBodyMaybe(body, { coerce: true })
    let res = await SUT.parse(body, { coerce: true })
    $dev(res)
  })
})
