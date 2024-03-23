import { TimeServiceMock } from './TimeServiceMock.node.js'
import { TimeService } from './TimeService.js'
import { expect, describe, it } from 'vitest'
import { $dev } from '../../logger/index.js'

describe('x', () => {
  it.skip('x #broken', async () => {
    TimeServiceMock.fakeTime('2020.06.27Z')
    expect(TimeService.now()).toEqual(new Date('2020-06-27'))

    // can fake time multiple times in same run
    TimeServiceMock.fakeTime('2020.06.10Z')
    expect(TimeService.now()).toEqual(new Date('2020-06-10'))
  })

  it('x', async () => {
    // let sut =  new TimeServiceMock()
    // sut.fakeTime('2020')
    let res = new Date('2020-W10')
    $dev(res)
    // if (kv.week) {
    //   let today = startOfISOWeek(
    //     setISOWeek(TimeService.now(), parseInt(kv.week ?? '02')),
    //   )
    //   TimeServiceMock.fakeTime(today)
  })
})
