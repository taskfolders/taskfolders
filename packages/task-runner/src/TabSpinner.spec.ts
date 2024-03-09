import { expect, describe, it } from 'vitest'

import { TabSpinner } from './TabSpinner.js'
import { delay } from '@taskfolders/utils/native/promise/delay'

it.skip('x', async () => {
  let sut = new TabSpinner()
  // sut.spin()
  // sut.spin()
  await delay(2000)
})
