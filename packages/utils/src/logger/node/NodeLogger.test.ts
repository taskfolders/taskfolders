import { expect, describe, it } from 'vitest'
import { setupLogger } from '../_test/setupLogger.js'

it('simple print', async () => {
  let sut = setupLogger({ debug: true })
  sut.log._debug = true
  sut.log.put('text')
})
