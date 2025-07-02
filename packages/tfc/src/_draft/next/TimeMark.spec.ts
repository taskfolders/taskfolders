import { it } from 'vitest'
import { TimeMark } from './TimeMark.js'

it.only('x after-v2', () => {
  let sut = TimeMark.fromValue('2025')
  console.log(sut)
  sut = TimeMark.fromValue('2025-W02')
  console.log(sut)
  //sut = TimeMark.fromValue('2w', { now: new Date('2025-01-01') })
  sut = TimeMark.fromValue('2w')
  let now = new Date('2025-01-01')
  console.log(sut)

  sut = TimeMark.fromValue('panda-event')
  //    sut.panda
  console.log(sut)
})
