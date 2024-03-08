import { addDays } from 'date-fns/addDays'
import { addHours } from 'date-fns/addHours'
import { addMinutes } from 'date-fns/addMinutes'
import { atomicDuration } from './atomicDuration.js'
import { expect, describe, it } from 'vitest'

let now = new Date('2022-03-03')
let sut = atomicDuration

describe('x', () => {
  it('trim max number of atoms', async () => {
    let d_future = addHours(now, 200)
    expect(atomicDuration(d_future, { start: now })).toBe('1w 1d')

    expect(atomicDuration(d_future, { start: now, atoms: 3 })).toBe('1w 1d 8h')
    expect(atomicDuration(d_future, { start: now, atoms: 1 })).toBe('1w')
  })

  it('x', async () => {
    let d_future = addDays(now, 12)
    let all = atomicDuration(d_future, { start: now })
    expect(all).toBe('1w 5d')

    d_future = addHours(now, 50)
    expect(atomicDuration(d_future, { start: now })).toBe('2d 2h')

    d_future = addMinutes(now, 65)
    expect(atomicDuration(d_future, { start: now })).toBe('1h 5m')
  })

  it('paddings', async () => {
    let future = addHours(now, 200)
    expect(
      atomicDuration(future, { start: now, atoms: 3, padding: true }),
    ).toBe('01w 01d 08h')
  })

  it('padding when less atoms needed than told #edge', async () => {
    let now = new Date('2022-04-21T20:01:00')

    let run = (x: number, kv: { paddingFull? } = {}) => {
      let time = new Date(now.getTime() + x)
      return sut(time, {
        start: now,
        atoms: 2,
        padding: { padChar: ' ' },
        // paddingFull: true,
        ...kv,
      })
    }

    expect(run(60_000 * 61)).toBe('01h 01m')

    // padding when 2 atoms requested, but only 1 needed #edge
    expect(run(60_000 * 60)).toBe('01h')

    expect(run(10_000)).toBe('10s')
    expect(run(10_000, { paddingFull: false })).toBe('10s')
    expect(run(10_000, { paddingFull: true })).toBe('    10s')
  })

  it('milliseconds #edge', async () => {
    let now = new Date()
    let before = new Date(now.getTime() - 250)
    let res = atomicDuration(now, { start: before, atoms: 3, padding: true })
    expect(res).toBe('250ms')
  })
})
