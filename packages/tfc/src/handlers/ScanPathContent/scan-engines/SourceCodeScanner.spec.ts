import { expect, describe, it } from 'vitest'
import { setupAfterScan } from '../_test/setup.js'
import dedent from 'dedent'
import { $dev } from '@taskfolders/utils/logger'

it('x', async () => {
  let uid = '036ee5e6-7f53-4594-b9a8-b895558f7fce'
  let sut = await setupAfterScan({
    disk: {
      '/app/code.ts': dedent`
        // @uid ${uid}
        class Foo {}
        `,
      '/app/index.md': dedent`
        ---
        type: tf
        ---
        
        foo note`,
    },
  })
  // expect(res.path).toBe('/app/index.md')
  $dev(sut.disk)
})
