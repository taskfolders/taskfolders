import { foo } from './_test/fooFunction'

describe('x', () => {
  it('x', async () => {
    // let r1 = getCallerFile()
    let res = foo()
    let all = res.stack.map(x => {
      return { line: x.getFileName(), ln: x.getLineNumber() }
    })
  })
})
