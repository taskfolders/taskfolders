import { expect, describe, it } from 'vitest'

import { foo, debugMe } from './_test/fooFunction.js'
import { getCallStack, toClearStackFrame } from './getCallerFile.js'

describe('x', () => {
  it('x', async () => {
    // let r1 = getCallerFile()
    let res = foo()
    let all = res.stack.map(x => {
      return { line: x.getFileName(), ln: x.getLineNumber() }
    })
  })

  it('x', async () => {
    // let data = debugMe()
  })
})
