import { expect, describe, it } from 'vitest'

import { expectType } from '../../types/expectType.js'
import { createSort } from './createSort.js'

let sampleObjects = [{ name: 'a' }, { name: 'c' }, { name: 'b' }]

describe('x', () => {
  describe('sort array of Objects', () => {
    it('by key', async () => {
      let spy
      if (spy === 1) {
        let r0 = ['one', 'two'].sort(
          // @ts-expect-error TEST
          createSort({ key: 'one' }),
        )
      }

      let r1 = sampleObjects.sort(createSort({ key: 'name' }))
      expectType<(typeof r1)[0], { name: string }>()
      expect(r1.map(x => x.name)).toEqual(['a', 'b', 'c'])

      let r2 = sampleObjects.sort(
        createSort({ key: 'name', direction: 'descending' }),
      )
      expect(r2.map(x => x.name)).toEqual(['c', 'b', 'a'])
      expectType<(typeof r2)[0], { name: string }>()
    })

    it('by getter', async () => {
      let spy
      if (spy === 1) {
        sampleObjects.sort(
          createSort({
            getter: x =>
              // @ts-expect-error TEST
              x.bogus,
          }),
        )
      }

      let r3 = sampleObjects.sort(createSort({ getter: x => x.name }))
      expect(r3.map(x => x.name)).toEqual(['a', 'b', 'c'])
      expectType<(typeof r3)[0], { name: string }>()
    })
  })

  describe('sort array', () => {
    describe('strings', () => {
      it('of strings', async () => {
        let spy
        if (spy === 1) {
          sampleObjects.sort(
            // @ts-expect-error TEST
            createSort(),
          )
        }

        let sample = ['a', 'c', 'b']
        let r1 = sample.sort(createSort())
        expect(r1).toEqual(['a', 'b', 'c'])
        expectType<(typeof r1)[0], string>()

        let r2 = sample.sort(createSort({ direction: 'descending' }))
        expect(r2).toEqual(['c', 'b', 'a'])
      })

      it.skip('options #todo', async () => {
        //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
      })
    })

    it('of numbers', async () => {
      let sample = [1, 3, 2]
      let r1 = sample.sort(createSort())
      expect(r1).toEqual([1, 2, 3])
      expectType<(typeof r1)[0], number>()
    })

    it('of dates', async () => {
      let a = new Date()
      let b = new Date(a.getTime() + 1000)
      let c = new Date(a.getTime() + 2000)
      let sample = [a, c, b]
      let r1 = sample.sort(createSort())
      expect(r1).toEqual([a, b, c])
      expectType<(typeof r1)[0], Date>()
    })
  })
})
