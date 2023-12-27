import { IssueCollection } from './IssueCollection'
import { IssueGateway } from './IssueGateway'
import { IssueItem } from './IssueItem'

describe('x', () => {
  it.skip('main #story', async () => {
    const Foo = IssueItem.define<{ delta }, { fox }>({
      code: 'foo-1',
      test(par) {
        return { delta: 1 }
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
        return { delta: 1 }
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
    gw.applyTo(c3).check(Panda, () => {
      return false
    })

    $dev(c3)
    let c4 = []
    gw.applyTo(c4)
      .check(Panda, () => {
        return false
      })
      .check(Bamboo, { fox: 1 })
    $dev({ c4 })
  })
})
