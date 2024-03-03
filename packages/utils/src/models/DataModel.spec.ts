import { expect, describe, it } from 'vitest'
import { DataModel } from './DataModel.js'

class Panda {
  type: string
  fox = 1
  date: Date
  static fromJSON(doc) {
    return DataModel.parseSync(Panda, doc)
  }
}

DataModel.decorate(Panda, {
  type: {
    value: 'panda',
    field: 'type',
  },
  before(doc) {
    doc._spyBefore = true
    return doc
  },
  properties: {
    date: {
      parse: x => new Date(x),
    },
  },
})

it('x', async () => {
  let res = DataModel.parseSync(Panda, {
    type: 'panda',
    fox: 1,
    date: '2020-01-01',
  })
  expect(res.fox).toBe(1)
  expect(res.date).toEqual(new Date('2020-01-01'))
  expect(res['_spyBefore']).toBe(true)
  // console.log(res)
})

it.skip('execute actions before parsing', async () => {})

describe('edge cases', () => {
  it('avoid parsing undefined', async () => {
    class Panda {
      all
    }

    DataModel.decorate(Panda, {
      properties: {
        all: {
          parse(x) {
            return x.map(x => x)
          },
        },
      },
    })

    DataModel.parseSync(Panda, {})
  })
  it('fail if type is missing', async () => {
    let err: Error
    try {
      DataModel.parseSync(Panda, { fox: 1, date: '2020-01-01' })
    } catch (e) {
      err = e
    }
    expect(err.message).toMatch(/Could not.*type/)
  })
})
