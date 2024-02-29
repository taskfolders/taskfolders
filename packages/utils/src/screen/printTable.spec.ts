import { printTable } from './printTable.js'
describe('x', () => {
  it('x', async () => {
    let rows = [
      ['one', 'two'],
      ['long one', 'long two'],
    ]
    let res = printTable({ rows }).text()
    expect(res).toContain('one       two')
    expect(res).not.toContain('----')

    res = printTable({ rows, headers: ['a', 'b'] }).text()

    expect(res).toContain('a         b')
    expect(res).toContain('----')
    expect(res).toContain('one       two')
  })
})
