import { expect, describe, it } from 'vitest'
import { setupAfterScan } from '../_test/setup.js'
import dedent from 'dedent'

it('x', async () => {
  let uid = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
  let sut = await setupAfterScan({
    disk: {
      '/app/index.md': dedent`
        ---
        uid: ${uid}
        sid: my-id
        type: tf
        ---
        
        foo note`,
    },
  })
  let res = sut.disk.findById('my-id')
  expect(res.path).toBe('/app/index.md')
  $dev(sut.disk)
})
