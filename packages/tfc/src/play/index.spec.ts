import { expect, describe, it } from 'vitest'
import { decryptGPGMessage } from './decryptGPGMessage.js'
import { readFileSync } from 'fs'
import {
  TaskFoldersMarkdown,
  // MarkdownDocument,
} from '@taskfolders/utils/markdown'

it('x', async () => {
  let file = readFileSync('/tmp/foo.md.asc')
  let out = await decryptGPGMessage(file)
  let md = await TaskFoldersMarkdown.fromBodyMaybe(out.message, {
    coerce: true,
  })

  let uid = md.data.uid
  $dev({ md, uid })
})

it('x', async () => {})
