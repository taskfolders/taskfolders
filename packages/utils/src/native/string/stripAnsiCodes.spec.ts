import { expect, describe, it } from 'vitest'
// import { Terminal } from '../../console/_node/Terminal.js'
import * as chalk from 'chalk'
import { stripAnsiCodes } from './stripAnsiCodes.js'
import { $dev } from '../../logger/index.js'

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|')

  // e slint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(pattern, onlyFirst ? undefined : 'g')
}

describe('x', () => {
  let s1 =
    "\u001b[33m\u001b]8;;mscode:///home/fgarcia/work/taskfolders/packages/apps/api-local/src/ApiLocalApp.ts:12:5\u0007DEV  \u001b]8;;\u0007\u001b[39m Start local server\n\u001b[36m\u001b]8;;mscode:///home/fgarcia/work/taskfolders/packages/core/src/network/koa/_node/KoaApiService.ts:249:14\u0007INFO \u001b]8;;\u0007\u001b[39m [koa] Koa started on http://127.0.0.1:3008/\n\u001b[33m\u001b]8;;mscode:///home/fgarcia/work/taskfolders/packages/apps/api-local/src/ApiLocalApp.ts:53:5\u0007DEV  \u001b]8;;\u0007\u001b[39m\n  {\n    routes: [\n      { path: \u001b[32m'/api/draft/list/foo'\u001b[39m, method: \u001b[32m'GET'\u001b[39m },\n      { path: \u001b[32m'/api/draft/list/sample-1'\u001b[39m, method: \u001b[32m'GET'\u001b[39m },\n      { path: \u001b[32m'/api/health'\u001b[39m, method: \u001b[32m'GET'\u001b[39m }\n    ]\n  }\n\u001b[33m\u001b]8;;mscode:///home/fgarcia/work/taskfolders/packages/core-domain/src/fork/tryParentForkReady.ts:22:3\u0007DEV  \u001b]8;;\u0007\u001b[39m Tell parent start info\n\r\u001b[33m\u001b]8;;mscode:///home/fgarcia/work/taskfolders/packages/apps/api-local/src/index.start.ts:22:3\u0007DEV  \u001b]8;;\u0007\u001b[39m\n  {\n    pid: \u001b[33m1222881\u001b[39m,\n    title: \u001b[32m'/home/fgarcia/work/taskfolders/node_modules/electron/dist/electron /home/fgarcia/work/taskfolders/packages/apps/api-local/_build/code/index.start.js'\u001b[39m\n  }"

  // TODO:now
  it.skip('x strip just links, not the colors #todo', async () => {
    let link //= Terminal.hyperlink({ text: 'link', path: '/app/foo.json' })
    let txt = `Hello ${chalk.green('green')} or ${chalk.red(
      'red',
    )} and ${link} end`
    let rx = ansiRegex()
    let ma = txt.match(rx)
    let m2 = stripAnsiCodes(txt)
    expect(m2).toBe(
      //'Hello \x1B[32mgreen\x1B[39m or \x1B[31mred\x1B[39m and link end',
      `Hello \x1B[32mgreen\x1B[39m or \x1B[31mred\x1B[39m and <a class='link' href='file:///app/foo.json'>link</a> end`,
    )

    $dev(txt)
    $dev(m2)
    $dev({ m2 })

    let r2 = stripAnsiCodes(s1)
    $dev({ r2 })
  })
})
