import { expect, describe, it } from 'vitest'
import { getKeyPath } from './getKeyPath.js'

it('x', async () => {
  let data = { doc: { fox: { delta: 123 } } }
  let res = getKeyPath(data, 'doc.fox')
  expect(res.ok).toBe(true)
  expect(res.data).toEqual({ delta: 123 })
})
