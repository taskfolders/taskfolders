import { expect, describe, it } from 'vitest'
import chalk from 'chalk'
import { padEnd } from './padEnd.js'

import { stripAnsiCodes } from './stripAnsiCodes.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'
import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'

function padRight(txt: string, size: number) {
  let raw = stripAnsiCodes(txt)
  let next = raw.padEnd(size)
  return next.replace(raw, txt)
}

describe('x', () => {
  it('x #ci-broken', async () => {
    let txt = 'foo'
    let t1 = chalk.blue(txt)
    t1 = shellHyperlink({ text: t1, path: '/tmp', cwd: '/' })
    let res = padEnd(t1, 1)
    expect(res).toBe(
      //
      `\x1B]8;;file:///tmp\x07\x1B[34mfoo\x1B[39m\x1B]8;;\x07`,
    )

    res = padEnd(t1, 8)
    expect(res).toBe(
      `\x1B]8;;file:///tmp\x07\x1B[34mfoo\x1B[39m\x1B]8;;\x07     `,
    )
  })

  it('x #ci-broken', async () => {
    let screen = new ScreenPrinter()
    screen.log(x => {
      let link = shellHyperlink({ path: '/tmp/foo.json', text: 'foo' })
      return [x.color.blue('one'), link].join(':')
    })

    let txt = screen.text()
    //let final = padRight(txt, 10)
    let final = padEnd(txt, 10)
    let want =
      '\x1B[34mone\x1B[39m:\x1B]8;;file:///tmp/foo.json\x07foo\x1B]8;;\x07   '

    expect(final).toBe(want)
  })
})
