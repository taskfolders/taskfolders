import { expect, describe, it } from 'vitest'
import { decryptGPGMessage } from './decryptGPGMessage.js'
import { readFileSync } from 'fs'
import { encryptGPGMessage } from './encryptGPGMessage.js'
import {
  TaskFoldersMarkdown,
  // MarkdownDocument,
} from '@taskfolders/utils/markdown'

it('x #todo', async () => {
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
