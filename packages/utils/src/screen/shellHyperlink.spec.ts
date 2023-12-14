import { shellHyperlink } from './shellHyperlink'
describe('x', () => {
  it('x', async () => {
    $dev('..')

    let sut = shellHyperlink({ path: '/tmp/x.js', text: 'foo', lineNumber: 3 })
    $dev(sut)
  })
})
