import { expect, describe, it } from 'vitest'

import { foo, debugMe, useVersion2 } from './_test/fooFunction.js'
import {
  getCallStack,
  toClearStackFrame,
  getCallerFile_v2,
} from './getCallerFile.js'

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

  it('x', async () => {
    let res = useVersion2({ debug: false, skipUniqueFiles: 0 })
    expect(res.path).toContain('getCallerFile.spec.ts')
  })
})
