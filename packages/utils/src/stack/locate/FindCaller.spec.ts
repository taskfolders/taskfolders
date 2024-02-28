import { FindCaller } from './FindCaller.js'

describe('x', () => {
  it.skip('x', async () => {
    let sut = FindCaller.forFile(__filename)
    $dev(sut)
  })
})
