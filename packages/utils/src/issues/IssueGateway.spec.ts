import { IssueGateway } from './IssueGateway'
import { IssueItem } from './IssueItem'
import { delay } from '../native/promise/delay'
import { isPromise } from '../native/promise/isPromise'

const BasicIssue = IssueItem.define({ code: 'basic-1' })
const DataIssue = IssueItem.define<{ fox }>({ code: 'typed-1' })
const TestIssue = IssueItem.define<{ bar: number }, { delta: number }>({
  code: 'typed-1',
  test(t) {
    if (t.delta > 1) {
      return { bar: t.delta }
    }
  },
})

describe('x', () => {
  it('check and modify test', async () => {
    const Panda = IssueItem.define<{ fox }>({ code: 'panda' })
    let sut = new IssueGateway()
    let res = sut.check(Panda, t => {
      t.message = 'Custom message'
      return {
        fox: 1,
      }
    })

    expect(res.message).toBe('Custom message')
    expect(res.data.fox).toBe(1)
  })

  it('force user to provide issue data', async () => {
    const Panda = IssueItem.define<{ fox }>({ code: 'panda' })
    let sut = new IssueGateway()
    let res = sut.check(Panda, () => {
      return { fox: 1 }
    })
    expect(res.code).toBe('panda')
    expect(res.data).toEqual({ fox: 1 })
  })

  xit('x #robustness #type #todo', async () => {
    let sut = new IssueGateway()

    let r1 = sut.check(BasicIssue, () => {
      return { bogus: 1 }
    })
  })

  describe('issue config', async () => {
    it.only('x', async () => {
      const BasicIssue = IssueItem.define({ code: 'basic-1' })
      let sut = new IssueGateway()
      let r1 = sut.check(BasicIssue, () => false)
      expect(BasicIssue.is(r1)).toBe(true)
      expect(sut.isEnabled(BasicIssue)).toBe(true)

      sut.config[BasicIssue.code] = { status: 'off' }
      r1 = sut.check(BasicIssue, () => false)
      expect(r1).toBe(undefined)
      expect(sut.isEnabled(BasicIssue)).toBe(false)
    })

    it('x', async () => {
      const Panda = IssueItem.define({ code: 'panda' })

      let gw = new IssueGateway()
      gw.config['foo-code-1'] = { status: null }

      let r1 = gw.check(Panda, () => {
        return false
      })
      expect(r1).toBeInstanceOf(IssueItem)

      let r2 = gw.check(Panda, () => {
        return
      })
      expect(r2).toBeFalsy()
    })
  })

  describe('async checks', () => {
    it('single check', async () => {
      let sut = new IssueGateway()

      let r1 = sut.check(BasicIssue, async () => {
        await delay(2)
        return false
      })
      expect(isPromise(r1)).toBe(true)
      let r2 = await r1
      expect(BasicIssue.is(r2)).toBe(true)
    })

    it('group check', async () => {
      let all = []
      let sut = new IssueGateway()
      await sut
        .applyTo(all)
        .check(DataIssue, async () => {
          return { fox: 1 }
        })
        .check(DataIssue, () => {
          return { fox: 2 }
        })
        .done()

      expect(all[0].data).toEqual({ fox: 1 })
      expect(all[1].data).toEqual({ fox: 2 })
    })
  })

  describe('collect', () => {
    it('collect user checks', async () => {
      const Panda = IssueItem.define<{ fox }>({ code: 'panda' })
      let all = []
      let sut = new IssueGateway()
      sut
        .applyTo(all)
        .check(Panda, () => {
          return { fox: 1 }
        })
        .check(Panda, () => {
          return { fox: 2 }
        })
      expect(all[0].code).toEqual('panda')
      expect(all[0].data).toEqual({ fox: 1 })
      expect(all[1].data).toEqual({ fox: 2 })
    })

    it.skip('async checks #broken', async () => {
      const Panda = IssueItem.define<{ fox }>({ code: 'panda' })
      let all = []
      let sut = new IssueGateway()
      await sut
        .applyTo(all)
        .check(Panda, async () => {
          return { fox: 1 }
        })
        .done()

      expect(all[0].code).toEqual('panda')
      expect(all[0].data).toEqual({ fox: 1 })
    })
  })

  describe('x', () => {
    it('x with issue test type', async () => {
      let sut = new IssueGateway()
      let res = sut.check(TestIssue, { delta: 2 })
      expect(res.data).toEqual({ bar: 2 })

      // TODO should fail ts
      // @ts-expect-error
      res.data.bogus
    })
  })
})
