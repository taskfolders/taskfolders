import { expect, describe, it } from 'vitest'
import { cleanObjectCopy } from './cleanObject.js'

it('x', async () => {
  let res = cleanObjectCopy({ a: null, b: 5 })
  expect(res).toEqual({ b: 5 })
})

it('x', async () => {
  let res = cleanObjectCopy({ a: null, b: 5 }, ({ value }) => {
    return !value
  })
  expect(res).toEqual({ b: 5 })
})

it('x', async () => {
  let res = cleanObjectCopy({ _a: null, b: 5 }, ({ key }) => {
    return key.startsWith('_')
  })
  expect(res).toEqual({ b: 5 })
})
