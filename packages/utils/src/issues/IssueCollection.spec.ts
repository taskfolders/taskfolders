import { expect, describe, it } from 'vitest'
import { IssueCollection } from './IssueCollection.js'
import { IssueGateway } from './IssueGateway.js'
import { IssueItem } from './IssueItem.js'
import { BasicIssue } from './_test/samples.js'

class DraftCollection extends IssueCollection {
  // Gateway
  _gateway: IssueGateway
  gate(gw: IssueGateway) {
    this._gateway = gw
    return this
  }
  check(klass, cb) {
    this._gateway.check(klass, cb)
    return this
  }
}

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

  it('quick insertion of issues', async () => {
    let sut = new IssueCollection()
    expect(sut.hasErrors()).toBe(false)
    expect(sut.hasWarnings()).toBe(false)

    sut.fail({ code: 'boom-1' })
    expect(sut.hasErrors()).toBe(true)
    expect(sut.hasWarnings()).toBe(false)

    sut.warn({ code: 'boom-2' })
    expect(sut.hasErrors()).toBe(true)
    expect(sut.hasWarnings()).toBe(true)

    expect(sut.all[0].code).toBe('boom-1')
    expect(sut.all[0].severity).toBe('error')
    expect(sut.all[1].code).toBe('boom-2')
    expect(sut.all[1].severity).toBe('warning')
  })

  it('x check if has issues', async () => {
    let sut = new IssueCollection()
    expect(sut.hasIssues()).toBe(false)
    sut.push(IssueItem.create({ code: 'one' }))
    expect(sut.hasIssues()).toBe(true)
  })

  describe('array like operations', async () => {
    function setup() {
      let sut = new IssueCollection()
      sut.push(IssueItem.create({ code: 'one' }))
      sut.push(IssueItem.create({ code: 'two' }))
      return sut
    }

    it('for loop', async () => {
      let sut = setup()

      let res = []
      for (let x of sut) {
        res.push(x.code)
      }
      expect(res).toEqual(['one', 'two'])
    })

    it('.map', async () => {
      let sut = setup()

      let res = sut.map(x => {
        return x.code
      })
      expect(res).toEqual(['one', 'two'])
    })
  })

  describe('x', () => {
    it('with gateway #draft', async () => {
      let gw = new IssueGateway()
      let sut = new DraftCollection()
      sut
        .gate(gw)
        .check(BasicIssue, t => {
          // TODO
          // t.data = { bogus: 1 }
          return false
        })
        .check(BasicIssue, t => {
          return false
        })
    })
  })
})
