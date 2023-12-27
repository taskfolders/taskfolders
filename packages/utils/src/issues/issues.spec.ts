import { IssueCollection } from './IssueCollection'
import { IssueGateway } from './IssueGateway'
import { IssueItem } from './IssueItem'

describe('x', () => {
  it.skip('main #story', async () => {
    const Foo = IssueItem.define<{ delta }, { fox }>({
      code: 'foo-1',
      test(par) {
        return false
      },
    })
    let f1 = new Foo()
    let o1 = Foo.test({
      fox: 1,
      // @ts-expect-error TEST
      bogus: 2,
    })

    class Panda extends IssueItem<{ delta: number }> {
      static override code = 'panda-code-1'
      override code = 'panda-code-1'

      override test = n => {
        if (n > 1) {
          return false
        }
      }
    }
    class Bamboo extends IssueItem<unknown, { fox }> {
      static override code = 'bamboo-code-1'
    }

    let i1 = new IssueItem({ code: 'foo-code-1' })
    let i2 = new IssueItem({ code: 'foo-code-2' })

    let col = new IssueCollection()
    // col.push(i1)
    // col.push(i2)

    let gw = new IssueGateway()
    gw.config['foo-code-1'] = { enabled: true }

    col.push(
      gw.check(Panda, () => {
        return false as any
      }),
    )
    // .push(
    //   gw.check(Bamboo, () => {
    //     return true
    //   }),
    // )

    let r1 = col.find(Panda)
    $dev(r1)
    for (let isu of col) {
      $dev(isu)
    }

    let c2 = new IssueCollection()
      .gate(gw)
      .check(Panda, t => {
        // TODO
        // t.data = { bogus: 1 }
        return false
      })
      .check(Bamboo, t => {
        return false
      })

    let c3 = new IssueCollection()
    gw.with(c3).check(Panda, () => {
      return false
    })

    $dev(c3)
    let c4 = []
    gw.with(c4)
      .check(Panda, () => {
        return false
      })
      .check(Bamboo, { fox: 1 })
    $dev({ c4 })
  })

  describe('x', () => {
    describe('issues', () => {
      it('x - issues', async () => {
        // Basic type test
        // WARNING keep this as partial interface avoid methods/logic in this class. You want users to just define a {struct}
        let basic: IssueItem = {
          code: 'one',
          severity: 'error',
        }

        const Simple = IssueItem.define({ code: 'simple' })

        // data and tester
        const Panda = IssueItem.define<{ delta: number }, { fox }>({
          code: 'foo-1',
          test(x) {
            return x.fox > 1
          },
        })

        // extensible
        class Foo extends IssueItem.define<{ delta: number }, { fox }>({
          code: 'foo-1',
        }) {}

        // message
        const M = IssueItem.define({ code: 'm-1', message: 'Big mess' })

        let s1 = new Simple()
        let s2 = new Panda()
        let s3 = new Foo()
        $dev([s1, s2, s3, new M()])
      })

      it('x', async () => {
        const Bamboo = IssueItem.define({
          code: 'bamboo',
          url: 'https://example.com',
        })

        // TEST quick instance create
        // TODO #now create requesting T type
        // TODO #now create with static self test? or yield null
        $dev({ Bamboo, n: new Bamboo() })
      })
    })

    describe('x gateway', () => {
      it('x gateway', async () => {
        const Panda = IssueItem.define({ code: 'panda' })

        let gw = new IssueGateway()
        gw.config['foo-code-1'] = { enabled: true }

        let r1 = gw.check(Panda, () => {
          return false
        })
        expect(r1).toBeInstanceOf(IssueItem)

        let r2 = gw.check(Panda, () => {
          return
        })
        expect(r2).toBeFalsy()
      })

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

      it('force user to provide data #todo', async () => {
        const Panda = IssueItem.define<{ fox }>({ code: 'panda' })
        let sut = new IssueGateway()
        let res = sut.check(Panda, t => {
          t.message = 'Custom message'
          return { fox: 1 }
        })
        $dev(res)
      })

      describe('collect', () => {
        it('collect user checks', async () => {
          const Panda = IssueItem.define<{ fox }>({ code: 'panda' })
          let all = []
          let sut = new IssueGateway()
          sut
            .with(all)
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
            .with(all)
            .check(Panda, async () => {
              return { fox: 1 }
            })
            .done()

          expect(all[0].code).toEqual('panda')
          expect(all[0].data).toEqual({ fox: 1 })
        })
      })
    })

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
  })
})
