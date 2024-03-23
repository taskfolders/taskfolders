/**
 * TODO drop m/milestone
 */

import { expect, describe, it } from 'vitest'

import { TimeMarker } from './TimeMarker.js'
import { TimeServiceMock } from './TimeServiceMock.node.js'
// import { utcToZonedTime } from 'date-fns-tz'
//import * as Sinon from 'sinon'
import { inspect } from 'util'
import { addWeeks } from 'date-fns'
import { $dev } from '../../logger/index.js'
let utcToZonedTime
let assert
let now = new Date('2020')

function setup(str: string, fakeDate?: string) {
  let fakeNow = now
  if (fakeDate) {
    fakeNow = new Date(fakeDate)
  }
  let r1 = TimeMarker.from(str, { now: fakeNow })
  return r1
}
// TODO testing #tmp parser before:w4

describe.skip('x', () => {
  // beforeEach(() => {
  //   Sinon.restore()
  // })
  // beforeEach(async () => {
  //   TimeServiceMock.fakeTime('2021-04-07')
  // })

  describe('good DSL', () => {
    it('x', async () => {
      let r1 = TimeMarker.from('2021-W12')
      assert(!r1.isSanitized)
      expect(r1.isReady).toEqual(true)

      // AfterHelper.from('2021/april')
      let r2 = TimeMarker.from('2021.02.02')
      assert(!r2.isSanitized)
      assert.eq(r2.final, '2021.02.02')
      assert.eq(r2._time, new Date(2021, 1, 2))
      expect(r2.isReady).toEqual(true)

      $dev('TODO padding and dots to -')
      let r3 = TimeMarker.from('2021.2.2')
      assert.eq(r3.final, '2021.2.2')
      assert.eq(r3._time, new Date(2021, 1, 2))
      expect(r3.isReady).toEqual(true)
    })

    it('iso date', async () => {
      let sut = TimeMarker.from('2021-05-20')
      assert.eq(sut.isValid(), true)
      assert.eq(sut.isSanitized, false)
      assert.eq(sut.final, '2021-05-20')
      expect(sut.isReady).toEqual(true)
    })

    it('week', async () => {
      let sut = TimeMarker.from('2021-W10')
      assert.eq(sut.isValid(), true)
      assert.eq(sut.final, '2021-W10')
      expect(sut.isReady).toEqual(true)
    })

    it('week +sanitize', async () => {
      let sut = TimeMarker.from('2021-w10')
      assert.eq(sut.final, '2021-W10')
      assert.eq(sut.isValid(), true)
      assert.eq(sut.isSanitized, true)
      expect(sut.isReady).toEqual(true)
    })

    it('month', async () => {
      let r1 = TimeMarker.from('2020-april')
      assert(r1.isValid())
      assert.eq(r1._time, new Date(2020, 3, 1))
      expect(r1.isReady).toEqual(true)
    })
  })

  describe('sanitized', () => {
    it('week numbers', async () => {
      let r1 = TimeMarker.from('w32')
      assert.eq(r1.given, 'w32')
      assert.eq(r1.final, '2021-W32')
      assert.eq(r1.isReady, false)
      assert(r1.isSanitized)
      assert(r1._time)

      let expectedTime = utcToZonedTime(new Date('2021-08-09'), process.env.TZ)
      // assert.eq(r1._time, expectedTime)
      $dev('more')
    })

    it('month name', async () => {
      {
        let r1 = TimeMarker.from('june')
        assert.eq(r1.final, '2021-June')
        assert.eq(r1.isReady, false)
        assert.eq(r1.isSanitized, true)
        assert(r1.isValid())
      }

      let r2 = TimeMarker.from('2020-june')
      assert.eq(r2.final, '2020-June')
      assert.eq(r2.isReady, true)
      assert.eq(r2.isSanitized, true)
      assert(r2.isValid())
    })
  })

  it.skip('event labels', async () => {
    let sut = TimeMarker.from('m/user-login')
    assert.eq(sut.final, 'milestone/user-login')
    assert.eq(sut.isMilestone, true)

    sut = TimeMarker.from('milestone/user-login')
    assert.eq(sut.final, 'milestone/user-login')
    assert.eq(sut.isMilestone, true)
  })

  it.skip('x - null', async () => {
    let sut = TimeMarker.from(null)
    // $dev(sut)
  })

  it('x - invalid', () => {
    let sut = TimeMarker.from('2020-foo')
    assert(sut._invalid)
    assert(sut.isActive())
    assert(!sut.isValid())

    sut = TimeMarker.from('some space')
    expect(sut.isValid()).toBe(false)
  })

  // TODO parse this comment, but not these ones in strings
  it('x - replace text', () => {
    let sut = TimeMarker.from('+1w')
    let text = '  // TODO something else before:+1w #tango'
    let res = sut.replace('before', text)
    assert.eq(res, '  // TODO something else before:2021-04-14 #tango')
  })

  describe('edge cases', () => {
    it('bogus: just a number', async () => {
      let sut = TimeMarker.from('32')
      assert.eq(sut.final, '32')
      assert.eq(sut.isSanitized, false)
    })

    it.skip('x', async () => {
      let sut = TimeMarker.from('2020-W1')
      $dev(sut)
    })

    // it('x - date #edge', async () => {})
  })
  describe('x - #draft', () => {
    it('x - sanitize', async () => {
      let sut = TimeMarker.from('2020-W1')
      assert(sut.isSanitized)
    })

    it('serialize', async () => {
      let sut = TimeMarker.from('2020-W1')
      // NOW unleash !!!
      let json = JSON.stringify(sut.toJSON())
      let res = TimeMarker.fromJSON(JSON.parse(json))
      assert.eq(res.final, '2020-W01')
    })

    it('check if needs to be sanitized', async () => {
      // expect(TimeMarker.isValid('2020-W1')).toBe(true)
      // expect(TimeMarker.isValid('2020-w1')).toBe(true)
      expect(TimeMarker.isValid('w12')).toBe(true)
    })
  })
})

describe('x', () => {
  // beforeEach(() => {
  //   Sinon.restore()
  //   TimeServiceMock.fakeTime('2020')
  // })

  it('x - week numbers (string)', async () => {
    let now = new Date('2021.04.07')
    expect(TimeMarker.from('W32', { now }).final).toBe('2021-W32')
    expect(TimeMarker.from('w32', { now }).final).toBe('2021-W32')
  })

  describe('relative dates', () => {
    it('x', async () => {
      $dev(TimeMarker.from('aug-10'))
    })

    it('x', async () => {
      let res = TimeMarker.from('aug')
      // expect(res.date()).toEqual(new Date('2020-08'))
      $dev(TimeMarker.from('aug-10'))
      $dev(TimeMarker.from('aug 10'))

      res = TimeMarker.from('aug')
      expect(res.type).toBe('relative')

      res = TimeMarker.from('august')
      expect(res.type).toBe('relative')

      res = TimeMarker.from('August')
      expect(res.type).toBe('relative')
    })

    it('+1d', async () => {
      TimeServiceMock.fakeTime('2021-04-07')
      let res = TimeMarker.from('+1d', { now: new Date('2021-04-07') })
      expect(res.final).toBe('2021-04-08')
      expect(res.isReady).toBe(false)
    })

    it('+1w', async () => {
      TimeServiceMock.fakeTime('2021-01-10')
      let now = new Date('2021-01-10')

      //let now = TimeServiceMock.now()

      let res = TimeMarker.from('2w', { now })
      expect(res.isReady).toBe(false)

      // with + adds exactly week (Sunday -> Sunday)
      expect(TimeMarker.from('+1w', { now }).final).toBe('2021-01-17')
      expect(TimeMarker.from('+2w', { now }).final).toBe('2021-01-24')

      // start week (Sunday -> Monday)
      expect(TimeMarker.from('1w', { now }).final).toBe('2021-W02')
    })

    it('x #alien', async () => {
      let d = '2021-01-10'
      let sut = TimeMarker.from('+1w', { now: new Date(d) })
      expect(sut.final).toBe('2021-01-17')
      expect(sut.date().toISOString()).toBe('2021-01-17T00:00:00.000Z')
      // $dev(sut.date())
      // $dev(sut)
      // $dev(new Date('2020-01-10'))
    })

    it('+1m', async () => {
      let d = '2021-01-10'
      TimeServiceMock.fakeTime('2021-01-10')
      expect(setup('+1m', d).final).toBe('2021-02-10')
      expect(setup('+2m', d).final).toBe('2021-03-10')

      let r1 = setup('+2m', d)
      expect(r1.final).toBe('2021-03-10')
      expect(r1.date().toISOString()).toBe('2021-03-10T00:00:00.000Z')
    })
  })

  describe('compare', () => {
    it('x', async () => {
      TimeServiceMock.fakeTime('2021.05.05')
      expect(TimeMarker.from('w10').isActive()).toBe(true)
      expect(!TimeMarker.from('w30').isActive()).toBe(true)
      // TODO enable?
      // assert.eq(TimeMarker.from(undefined).isActive(), true)
    })

    describe('sort', () => {
      it('sort pushing last invalid markers', async () => {
        TimeServiceMock.fakeTime('2020.02.01')
        let s1 = setup('1d', '2020.02.01')
        let s2 = setup('foo', '2020.02.01')
        let s3 = setup('2d', '2020.02.01')
        let all = [s1, s2, s3]

        let res = all.sort(TimeMarker.sort())

        expect(res[0].final).toBe('2020-02-02')
        expect(res[1].final).toBe('2020-W06')
        expect(res[2].final).toBe('foo')

        res = all.sort(TimeMarker.sort('descending'))
        expect(res[0].final).toBe('2020-W06')
        expect(res[1].final).toBe('2020-02-02')
        expect(res[2].final).toBe('foo')

        // $dev(TimeMarker.from('foo'))
      })

      it.skip('sort nulls', async () => {
        TimeServiceMock.fakeTime('2020.02.01')
        let all = [
          //
          TimeMarker.from('w3'),
          null,
          TimeMarker.from('w4'),
        ]

        let res = all.sort(TimeMarker.sort())
        $dev(res)
      })
    })
  })

  describe('inspect', () => {
    it('x', async () => {
      TimeServiceMock.fakeTime('2022')
      let sut = setup('w10', '2022')
      expect(inspect(sut)).toBe('<TimeMarker "2022-W10" date +sanitized>')

      sut = TimeMarker.from('foo')
      expect(inspect(sut)).toBe('<TimeMarker "foo" id>')
    })
  })
  describe('#draft', () => {
    it('single digit week #edge', async () => {
      let sut = setup('w2')
      expect(sut.final).toBe('2020-W02')
    })

    describe('normalize dates', () => {
      it('to week start', async () => {
        let sut = TimeMarker.from('2022-04-04')
        expect(sut.final).toBe('2022-W14')
      })

      it('to month start', async () => {
        let sut = TimeMarker.from('2020-02-01')
        expect(sut.final).toBe('2020-February')
        // assert.eq(r1.final, '2021/june')
      })

      it('month and week start #edge', async () => {
        let sut = TimeMarker.from('2024-01-01')
        expect(sut.final).toBe('2024-January')
        // also 2024-W01
      })
    })

    it.skip('x', async () => {
      // now at W02, Wednesday
      let now = addWeeks(TimeServiceMock.now(), 1)
      let ex = TimeServiceMock.explain(now)
      expect(ex.day).toBe('Wednesday')

      // set to W04, Monday
      let date = TimeMarker.from('w4').date()
      ex = TimeServiceMock.explain(date)
      expect(ex.week).toBe(4)
      expect(ex.day).toBe('Monday')
      expect(date.toISOString()).toBe('2020-01-19T23:00:00.000Z')

      // set for week 2, Wednesday
      let m1 = TimeMarker.from('+2w')
      ex = TimeServiceMock.explain(m1.date())
      expect(ex.day).toBe('Monday')
    })

    it('today', async () => {
      expect(TimeMarker.from('now', { now: now }).final).toBe('2020-01-01')
      expect(TimeMarker.from('today', { now: now }).final).toBe('2020-01-01')
      expect(TimeMarker.from('.', { now: now }).final).toBe('2020-01-01')
    })

    it('x #review #decide', async () => {
      let s3 = TimeMarker.from('2020-xxxx-dfk-kdf')
      expect(s3.isValid()).toBe(true)
      expect(s3.isReady).toBe(true)

      let s2 = TimeMarker.from('2020')
      expect(s2.isValid()).toBe(true)
      expect(s2.isReady).toBe(true)
      expect(s2.final).toBe('2020')
      expect(s2._time).toEqual(new Date('2020'))

      let s1 = TimeMarker.from('bogus')
      expect(s1.isReady).toBe(true)
    })

    it('time marker with alternative now time', async () => {
      let sut = TimeMarker.from('2w', { now: new Date('1995-02') })
      expect(sut.final).toBe('1995-W07')
    })

    describe('from ids #todo', () => {
      it('uid')
      it('x from sid', async () => {
        let sut = TimeMarker.from('my-sid')
        expect(sut.isId).toBe(true)
        expect(sut.final).toBe('my-sid')
        expect(sut.isReady).toBe(true)
        expect(sut.type).toBe('id')
        sut = TimeMarker.from('bogus')
        expect(sut.isReady).toBe(true)
        expect(sut.type).toBe('id')
      })
    })
  }) // #draft
})
