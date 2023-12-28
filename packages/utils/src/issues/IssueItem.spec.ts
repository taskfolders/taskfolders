import { IssueItem } from './IssueItem'
import { BasicIssue } from './_test/samples'

describe('x', () => {
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
        if (x.fox > 1) {
          return { delta: 1 }
        }
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

  it('x reject code on sub-issues but not adhoc #ts', async () => {
    IssueItem.create({ code: 'one' })

    BasicIssue.create({
      // @ts-expect-error
      code: 'one',
      message: 'foo',
    })
    BasicIssue.create()
  })
})
