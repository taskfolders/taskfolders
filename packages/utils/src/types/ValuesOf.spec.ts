import { expect, describe, it } from 'vitest'

import type { ValuesOf } from './ValuesOf.js'

describe('x', () => {
  it('x - with cast to const', async () => {
    const values = ['test', 'development', 'production'] as const
    type MyType = ValuesOf<typeof values>

    let res: MyType = 'test'
    // @ts-expect-error
    res = 'alien'

    // WARNING with no cast to const you just get 'strings'
    const bogus = ['test', 'development']
    type MyBogus = ValuesOf<typeof bogus>
    let r2: MyBogus = 'test'
    r2 = 'alien'
  })

  it('x - with readonly template (no const cast required)', async () => {
    function foo<K extends string>(keys: readonly K[]) {
      return keys[0]
    }
    let res = foo(['one', 'two'])
    res = 'one'
    // @ts-expect-error TEST
    res = 'alien'
  })
})
