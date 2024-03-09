import { expect, describe, it } from 'vitest'
import { fs as memFS, vol } from 'memfs'
import { VFile } from './LocalFileSystem.js'
import { LocalFileSystemMock } from './test/LocalFileSystemMock.js'

function setup(disk?) {
  disk ??= {
    '/app/.keep': '',
  }
  let sut = LocalFileSystemMock.fromFake(disk)
  return sut
}

it('x main #story', async () => {
  let sut = LocalFileSystemMock.fromFake({
    '/app/foo.json': JSON.stringify({ foo: 'bar' }),
  })

  //$dev(sut.raw.readdirSync('/'))
  let res = await sut.read<{ foo: string }>('/app/foo.json')

  expect(res.body).toEqual('{"foo":"bar"}')
  expect(res.json).toEqual({ foo: 'bar' })

  // TODO ?
  res.json.foo = 'yes'

  await sut.write('/app/foo.json', { foo: 'yes', bar: 123 })

  res = await sut.read<{ foo: string }>('/app/foo.json')
  expect(res.json).toEqual({ foo: 'yes', bar: 123 })
})

describe('x', () => {
  it('text file', async () => {
    let sut = setup()
    const f1 = new VFile({
      path: '/app/foo.txt',
      value: 'tango',
    })
    await sut.write(f1)

    let r1 = await sut.read(f1.path)
    expect(r1.body).toBe('tango')
  })

  it('json file', async () => {
    let sut = setup()
    const f2 = new VFile({
      path: '/app/foo.json',
      value: { fox: 1 },
    })
    await sut.write(f2)
    let r2 = await sut.read(f2.path)
    expect(r2.json).toEqual({ fox: 1 })
  })
})
