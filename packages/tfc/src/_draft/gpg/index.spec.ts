import { expect, describe, it } from 'vitest'
import { decryptGPGMessage } from './decryptGPGMessage.js'
import { readFileSync } from 'fs'
import { encryptGPGMessage } from './encryptGPGMessage.js'
import {
  TaskFoldersMarkdown,
  // MarkdownDocument,
} from '@taskfolders/utils/markdown'

import * as os from 'os'
import { spawn } from 'child_process'
import { ShellClient } from '@taskfolders/utils/shell'

async function shellHasCommand(cmd: string) {
  let isWindows = process.platform == 'win32'
  if (isWindows) return true
  let hasGPG = await ShellClient.query(`which ${cmd}`, {
    mustMock: false,
  }).catch(e => false)
  return !!hasGPG
}

it.only('x', async () => {
  expect(await shellHasCommand('gpg')).toBe(true)
  expect(await shellHasCommand('gpg-bogus')).toBe(false)
})

it.skip('x #todo', async () => {
  let file = readFileSync('/tmp/foo.md.asc')
  let out = await decryptGPGMessage(file)
  let md = await TaskFoldersMarkdown.fromBodyMaybe(out.message, {
    coerce: true,
  })

  let uid = md.data.uid
  //$dev({ md, uid })
})

describe('x #noci', () => {
  it('x encrypt-decrypt #story', async () => {
    let message = 'hello fox'
    let encrypted = await encryptGPGMessage({
      message,
      recipients: ['fgarcia'],
      armor: true,
    })

    let out = await decryptGPGMessage(encrypted.buffer)
    expect(out.message).toBe(message)
  })
})
