import { UidDatabase } from './LinksDatabase.js'
import { expect } from 'expect'

describe('x', () => {
  // TODO before:release settings, fixed and live test
  it('x #live', async () => {
    let sut = new UidDatabase()
    await sut.load()

    let uid = '77274bcd-b1e5-4dbb-91e9-73308c16b049'
    let found = sut.findByUid(uid)
    expect(found.endsWith('work/index.md')).toBe(true)
  })
})
