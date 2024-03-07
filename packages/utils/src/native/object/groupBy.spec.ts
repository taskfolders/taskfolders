import { describe, it, expect, test } from 'vitest'
import { groupBy } from './groupBy.js'
import './groupBy.polyfill.js'

let all = [1, 2, 3]

it('with function', () => {
  let r1 = groupBy(all, x => (x % 2 === 1 ? 'odd' : 'even'))
  expect(r1).toEqual({ odd: [1, 3], even: [2] })
})

it('with polyfill', async () => {
  let res = Object.groupBy(all, x => (x % 2 === 1 ? 'odd' : 'even'))
  expect(res).toEqual({ odd: [1, 3], even: [2] })
})
