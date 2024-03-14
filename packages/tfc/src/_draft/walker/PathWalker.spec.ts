import { expect, describe, it } from 'vitest'

import { PathWalker } from './PathWalker.js'
import { join } from 'path'
import micromatch from 'micromatch'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { dedent } from '@taskfolders/utils/native/string/dedent'

function setup(disk) {
  let sut = new PathWalker({ dir: '/app' })
  sut.fs = LocalFileSystemMock.fromFake(disk)
  return sut
}

it('x main #story #todo', async () => {
  let sut = setup({
    '/app/index.md': `
        ---
        type: tf
        workspace: true
        ---`,
    '/app/one/index.md': '',
    '/app/two/index.md': '',
    '/app/two/audio.mp3': '',
  })
  let res = await sut.lsRecurse('/app', {
    // glob: '**/*.(md|png)',
  })
  //$dev(res)
})

it('x when given a file, not a dir', async () => {
  let sut = setup({
    '/app/one/index.md': '',
  })
  let res = await sut.lsRecurse('/app/one/index.md')
  expect(res.length).toBe(1)
  expect(res[0].path).toBe('/app/one/index.md')
})

it('main exclude #story', async () => {
  let sut = setup({
    '/app/index.md': dedent`
        ---
        type: tf
        exclude:
          - one
          - two/deep/more
          - node_modules
          - '**/_dist'
          - ./only-exclude
        ---`,
    '/app/one/index.md': '',
    '/app/.git/index.md': '',
    '/app/two/index.md': '',
    '/app/two/_dist/index.md': '',
    '/app/two/foo.md': '', // no need to read md
    '/app/two/image.png': '',
    '/app/two/doc.pdf': '',
    '/app/two/deep/more/audio.mp3': '',

    '/app/only-exclude/index.md': '',
    '/app/two/only-exclude/index.md': '',

    // nested exclude
    '/app/three/node_modules/foo/index.md': '',

    // exclude at root
    '/app/node_modules/foo/index.md': '',
  })

  //$dev(sut.fs.raw.readFileSync('/app/index.md').toString())
  let res = await sut.lsRecurse('/app', { glob: '**/*.(md|png)' })

  let a1 = res.map(x => x.path)
  expect(a1).toEqual([
    '/app/index.md',
    '/app/two/foo.md',
    '/app/two/image.png',
    '/app/two/index.md',
    '/app/two/only-exclude/index.md',
  ])

  expect(res[0].path).toBe('/app/index.md')
  // expect(res[0].md).toBeTruthy()

  expect(sut.exclude).toContain('/app/only-exclude')
  expect(sut.exclude).toContain('/app/**/_dist')
})

it('x', async () => {
  let sut = setup({
    '/app/index.md': '',
    '/app/node_modules/index.md': '',
  })
  let res = await sut.lsRecurse('/app', { exclude: ['**/node_modules'] })
  //$dev(res)
})
