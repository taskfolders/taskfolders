import { expect, describe, it } from 'vitest'

import { FindImportUsers } from './FindImportUsers.js'

describe('x', () => {
  it('x find import users #draft #live #slow', { timeout: 5_000 }, async () => {
    // this.timeout(10_000)
    let sut = new FindImportUsers()
    await sut.execute()
  })
})
