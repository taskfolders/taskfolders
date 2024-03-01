import { DC } from './DC.js'
import { expect, describe, it } from 'vitest'

class DCTester {
  dc: DC

  static from(dc: DC) {
    let obj = new this()
    obj.dc = dc
    return obj
  }

  hijackCreate(klass, newCreate) {
    this.dc._doCreate = (kv, func) => {
      if (kv.klass === klass) {
        return newCreate()
      }
      return func()
    }
  }

  stubFetch(klass) {
    let { dc } = this
    let orig = dc.fetch.bind(dc)
    dc.fetch = klass => {
      return orig(klass)
    }
  }
}

class Panda {
  x
  y
  constructor(public value = 1) {}

  static from(x: number, y: number) {
    let obj = new this()
    obj.x = x
    obj.y = y
    return obj
  }
}

it('x tester hijack', async () => {
  let dc = new DC()
  let sut = DCTester.from(dc)

  let res = dc.fetch(Panda)
  expect(res.value).toBe(1)

  sut.hijackCreate(Panda, () => new Panda(2))
  res = dc.fetch(Panda)
  expect(res.value).toBe(2)
})

describe('stub fetch', () => {
  it('x tester hijack', async () => {
    let dc = new DC()
    let sut = DCTester.from(dc)

    sut.stubFetch(Panda)

    let res = dc.fetch(Panda)
    expect(res.value).toBe(1)
  })
})
