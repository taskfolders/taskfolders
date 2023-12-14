import { FindImportUsers } from './FindImportUsers'

describe('x', () => {
  it('x find import users #draft #live', async function () {
    this.timeout(10_000)
    let sut = new FindImportUsers()
    await sut.execute()
  })
})
