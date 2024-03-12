import { expect, describe, it } from 'vitest'
import { MarkdownDocument } from '@taskfolders/utils/markdown'
import { ShellClientMock } from '@taskfolders/utils/shell/test'

import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

let md = `---
scripts:
  foo: echo hello foo
  bar:
    - shell: echo hello bar
---
`

it.skip('x', async () => {
  let doc = await MarkdownDocument.fromBody<any>(md)
  console.log(doc.data.scripts)
  //
})

import { fs, vol } from 'memfs'
import { TaskRunnerApp } from './TaskRunnerApp.js'

// TODO solve mocking
it.skip('x #todo', async () => {
  let sut = new TaskRunnerApp()
  sut.fs = fs as any
  const json = {
    '/app/foo.ts': '1',
  }
  vol.fromJSON(json, '/app')

  let res = sut.executeRequest({ line: 'hello -v' })
  console.log(sut.fs.readFileSync('/app/foo.ts').toString())
})

describe('execute tasks', () => {
  it('execute npm script #live', async () => {
    let sut = new TaskRunnerApp()
    let mock = new ShellClientMock()
    sut.shell = mock
    sut.runner.shell = mock
    //sut.cwd = '/home/fgarcia/repos/tf-open/packages/utils'

    let res = await sut.executeRequest({ line: 'ping-npm 123' })
    expect(mock.calls[0].request.command).toBe('npm run ping-npm 123')
  })

  it('x execute md script #todo', async () => {
    let sut = new TaskRunnerApp()
    sut.cwd = '/home/fgarcia/repos/play/tk'
    // let res = await sut._findMdIndex('hi-1')
  })
})
