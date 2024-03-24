import { expect, describe, it } from 'vitest'
import { setupAfterScan } from '../_test/setup.js'
import dedent from 'dedent'
import { encryptGPGMessage } from '../../../_draft/gpg/encryptGPGMessage.js'
import { decryptGPGMessage } from '../../../_draft/gpg/decryptGPGMessage.js'

describe('x #noci', () => {
  it('x', async () => {
    let uid = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
    let message = dedent`
    ---
    uid: ${uid}
    ---
  `
    let msg = await encryptGPGMessage({ message, recipients: [], armor: true })

    let sut = await setupAfterScan({
      disk: {
        '/app/index.md.asc': msg.buffer,
      },
    })

    let dec = await decryptGPGMessage(
      sut.fs.raw.readFileSync('/app/index.md.asc'),
    )

    // expect(res.path).toBe('/app/index.md')
    expect(sut.disk.findById(uid).path).toBe('/app/index.md.asc')
  })

  it.skip('x parse binary encrypted file', async () => {
    let uid = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
    let message = dedent`
    ---
    uid: ${uid}
    ---
  `
    let msg = await encryptGPGMessage({ message, recipients: [], armor: false })

    let sut = await setupAfterScan({
      disk: {
        '/app/index.md.gpg': msg.buffer,
      },
    })

    let dec = await decryptGPGMessage(
      sut.fs.raw.readFileSync('/app/index.md.asc'),
    )

    // expect(res.path).toBe('/app/index.md')
    expect(sut.disk.findById(uid).path).toBe('/app/index.md.asc')
  })
})
