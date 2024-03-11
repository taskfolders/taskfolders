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

describe('write', () => {
  it('x #todo', async () => {
    let sut = LocalFileSystemMock.fromFake({
      '/app/.keep': '',
    })
    await sut.write('/app/foo.md', '')
  })
})

describe('read', () => {
  it('x', async () => {
    let sut = LocalFileSystemMock.fromFake({
      '/app/foo.json': JSON.stringify({ foo: 'bar' }),
    })
    let res = await sut.read<{ foo: string }>('/app/foo.json')

    expect(res.body).toEqual('{"foo":"bar"}')
    expect(res.json).toEqual({ foo: 'bar' })

    let r2 = await sut.read('/app/bogus.txt', { unsafe: true })
    expect(r2).toBe(null)

    //$dev(res.body)
  })
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

  it('.ls', async () => {
    let sut = setup({ '/app/foo.js': '' })
    let res = sut.lsSync('/app')
    expect(res).toEqual(['foo.js'])
  })

  it('.rm', async () => {
    let sut = setup({
      '/app/a': '',
      '/app/b': '',
    })
    expect(sut.lsSync('/app')).toEqual(['a', 'b'])
    await sut.rm('/app/a')
    expect(sut.lsSync('/app')).toEqual(['b'])
  })

  it('.mv', async () => {
    let sut = setup({
      '/app/a': '',
    })
    await sut.mv('/app/a', '/app/b')
    expect(sut.lsSync('/app')).toEqual(['b'])
  })
})
