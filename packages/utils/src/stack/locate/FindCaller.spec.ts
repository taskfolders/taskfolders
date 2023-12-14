import { FindCaller } from './FindCaller'

describe('x', () => {
  it.skip('x', async () => {
    let sut = FindCaller.forFile(__filename)
    $dev(sut)
  })
})
