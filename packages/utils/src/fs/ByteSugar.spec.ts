import { expect, describe, it } from 'vitest'

import { ByteSugar } from './ByteSugar.js'
import { inspect } from 'util'

describe('x', () => {
  const size = 10_000_000
  const sut = ByteSugar.fromBytes(size)

  it('convert number to human string', async () => {
    //assert.eq(bytesToHuman(2050), '2050 bytes')
    expect(ByteSugar.fromBytes(1024 * 1024).toHuman()).toBe('1 MiB')
    expect(ByteSugar.fromBytes(1024 * 1130).toHuman()).toBe('1.10 MiB')
    expect(ByteSugar.fromBytes(1024 * 1024 * 10).toHuman()).toBe('10 MiB')

    let s1 = ByteSugar.fromBytes(1024 * 1250 * 3)
    expect(s1.toHuman()).toBe('3.66 MiB')
    expect(s1.toHuman({ decimals: 0 })).toBe('4 MiB')
  })

  describe('human friendly representation', () => {
    it('inspect', async () => {
      let data = { size: sut }
      let res = inspect(data)
      expect(res).toBe('{ size: <ByteSugar 9.54 MiB> }')
    })

    it('interpolate string', async () => {
      let txt = `Disk size is ${sut}`
      expect(txt).toBe('Disk size is 9.54 MiB')
    })

    it('serialize', async () => {
      let data = JSON.parse(JSON.stringify({ size: sut }))
      expect(data.size).toBe(size)
      let res = ByteSugar.fromJSON(data.size)
      expect(res.bytes).toBe(size)
      expect(res).toBeInstanceOf(ByteSugar)
    })
  })

  describe('covert to other units', () => {
    it('x', async () => {
      const sut = ByteSugar.fromBytes(10_000_000_000)
      let res = sut.toUnit('GB')
      expect(res).toBeCloseTo(9.31, 0.005)
    })
  })
})
