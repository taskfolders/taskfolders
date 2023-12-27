import { IssueCollection } from './IssueCollection'
import { IssueItem } from './IssueItem'

describe('collection', () => {
  it('x', async () => {
    const Panda = IssueItem.define<{ fox }, { delta }>({ code: 'panda' })
    let sut = new IssueCollection()
    sut.push(new Panda())
    let res = sut.find(Panda)
    expect(res.code).toBe('panda')

    sut = IssueCollection.from([new Panda()])
    res = sut.find(Panda)
    expect(res.code).toBe('panda')
  })
})
