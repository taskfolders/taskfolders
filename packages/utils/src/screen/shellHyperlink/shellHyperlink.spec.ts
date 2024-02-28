import ansiEscapes from 'ansi-escapes'
import { shellHyperlink } from './shellHyperlink.js'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'

function tryReplace<T>(obj: T, key: keyof T, fakeValue, cb: () => void) {
  let valueBefore = obj[key]

  try {
    if (fakeValue === null) {
      delete obj[key]
    } else {
      obj[key] = fakeValue
    }
    cb()
  } finally {
    if (valueBefore) {
      obj[key] = valueBefore
    }
  }
}

function fakeEnv(key: string, fakeValue, cb) {
  tryReplace(process.env, key, fakeValue, cb)
}

describe('x', () => {
  it('auto template based on line number', () => {
    let r1 = shellHyperlink({ path: '/tmp/foo.md' })
    expect(r1).toContain('file:///tmp/foo.md')
    expect(stripAnsiCodes(r1)).toBe('/tmp/foo.md')

    fakeEnv('TF_HYPERLINK_TEMPLATE', null, () => {
      let r2 = shellHyperlink({
        path: '/tmp/foo.md',
        lineNumber: 3,
      })
      expect(r2).toContain('vscode://file/tmp/foo.md?lineNumber=3')
      expect(stripAnsiCodes(r2)).toBe('/tmp/foo.md')
    })

    $dev({ see: process.env.TF_HYPERLINK_TEMPLATE })

    // template given
    let r3 = shellHyperlink({
      path: '/tmp/foo.md',
      template: 'vscode',
    })
    expect(r3).toContain('vscode://file/tmp/foo.md')
  })

  it('x', async () => {
    $dev('..')

    let def = shellHyperlink({
      path: '/tmp/x.js',
      text: 'default-template',
      lineNumber: 3,
    })
    $dev(def)
    let sut = shellHyperlink({
      path: '/tmp/x.js',
      text: 'foo',
      lineNumber: 3,
      template: 'vscode',
    })
    $dev(sut)
  })

  it('x', async () => {
    let path = '/tmp/x.js'
    let sut = shellHyperlink({
      path: '/tmp/x.js',
      lineNumber: 3,
      template: 'vscode',
    })
    $dev(sut)
    sut = shellHyperlink({
      path: '/tmp/x.js',
      cwd: '/tmp',
      template: 'vscode',
    })
    $dev(sut)
    sut = shellHyperlink({
      path: '/tmp/x.js',
      cwd: '/tmp/foo',
      template: 'vscode',
    })
    $dev(sut)
  })
})
