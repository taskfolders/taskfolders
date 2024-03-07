import { expect, describe, it } from 'vitest'
import { jsonKeyPosition } from './jsonKeyPosition.js'

describe('x', () => {
  it('x', async () => {
    let s1 = { one: { scripts: { panda: 1, tango: 2 } } }
    let json = JSON.stringify(s1, null, 2)

    let { line } = jsonKeyPosition(json, ['one', 'scripts', 'tango'])
    expect(line).toBe(5)
  })
})
