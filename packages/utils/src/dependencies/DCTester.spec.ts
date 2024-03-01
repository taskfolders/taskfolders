import { DC } from './DC.js'
import { expect, describe, it } from 'vitest'
import { DCTester } from './DCTester.js'

function setup() {
  let dc = new DC()
  let sut = DCTester.from(dc)
  return { sut, dc }
}

class Bamboo {
  delta = 123
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

describe('stub create #draft', () => {
  // WHY not just .stubFetch?
  //   - just want to fetch
  it('x', async () => {
    let { dc, sut } = setup()

    sut.stubCreate(Panda, () => {
      return new Panda(2)
    })

    let r1 = dc.fetch(Panda)
    expect(r1.value).toBe(2)

    let r2 = dc.fetch(Bamboo)
    expect(r2.delta).toBe(123)
  })
})

describe('stub fetch', () => {
  it('x tester hijack', async () => {
    let { dc, sut } = setup()

    sut.stubFetch(Panda, x => {
      return new Panda()
    })

    let res = dc.fetch(Panda)
    expect(res.value).toBe(1)
  })

  it('x', async () => {
    let dc = new DC()
    let sut = DCTester.from(dc)

    sut.stubFetch(Panda, kv => {
      let args = kv.args as any[]
      return Panda.from(
        // @ts-expect-error TODO
        ...args,
      )
    })

    let res = dc.fetch(Panda, { method: 'from', args: [1, 2] })
    console.log(res)
    expect(res.value).toBe(1)
    expect(res.x).toBe(1)
    expect(res.y).toBe(2)
  })
})
