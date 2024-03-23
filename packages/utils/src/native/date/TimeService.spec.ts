import { $dev } from '../../logger/index.js'
import { TimeService } from './TimeService.js'
//import * as Sinon from 'sinon'
import { TimeServiceMock } from './TimeServiceMock.node.js'
import { expect, describe, it } from 'vitest'

describe('x', () => {
  it('x', async () => {
    $dev('no in')
    //Sinon.restore()
    let r1 = TimeService.now()
    expect(r1).toEqual(r1)
    TimeServiceMock.fakeTime('2021-08-01T05:12:23.954Z')
    let res = TimeService.now()
    expect(res.toISOString()).toMatch('2021-08-01')
  })
  it('.explain #todo', async () => {
    let res = TimeService.explain('2020-03-08T23:00:00.000Z')
    expect(res.week).toBe(11)
    $dev(res)
  })
})
