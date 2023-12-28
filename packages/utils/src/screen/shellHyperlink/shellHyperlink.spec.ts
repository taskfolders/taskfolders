import ansiEscapes from 'ansi-escapes'
import { ShellHyperlink, shellHyperlink } from './shellHyperlink'

describe('x', () => {
  it('x', async () => {
    $dev('..')

    let sut = ShellHyperlink.create({
      path: '/tmp/x.js',
      text: 'foo',
      lineNumber: 3,
      template: 'vscode',
    })
    $dev(sut)
  })

  it('x', async () => {
    let path = '/tmp/x.js'
    let sut = ShellHyperlink.create({
      // TODO drop
      text: '/tmp/x.js',
      path: '/tmp/x.js',
      template: 'vscode',
    })
    $dev(sut)
  })
})
