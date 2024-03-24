import { expect, describe, it } from 'vitest'
import { setupAfterScan } from '../_test/setup.js'
import dedent from 'dedent'
import { $dev } from '@taskfolders/utils/logger'

it('x', async () => {
  let u1 = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
  let u2 = '9e300db5-5d2a-4214-971d-236d5acacaaf'
  let sut = await setupAfterScan({
    disk: {
      '/app/index.md': dedent`
        ---
        uid: ${u1}
        sid: my-id
        type: tf
        ---
        
        foo note
        
        # some section
        uid: ${u2}
        `,
    },
  })
  expect(sut.disk.findById('my-id').path).toBe('/app/index.md')
  expect(sut.disk.findById(u1).path).toBe('/app/index.md')
  expect(sut.disk.findById(u2).path).toBe('/app/index.md')
  $dev(sut.disk)
})
