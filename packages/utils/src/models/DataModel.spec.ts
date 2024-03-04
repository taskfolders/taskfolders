import { expect, describe, it } from 'vitest'
import { DataModel, ModelDefinition, DataModelError } from './DataModel.js'
import { CustomError } from '../errors/CustomError.js'

class Panda {
  type: string
  fox = 1
  date: Date
  static fromJSON(doc) {
    return DataModel.deserialize(Panda, doc)
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
      fromJSON: x => new Date(x),
    },
  },
})

it('x', async () => {
  let res = DataModel.deserialize(Panda, {
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
      all: number[]
    }

    DataModel.decorate(Panda, {
      properties: {
        all: {
          fromJSON(x) {
            return x.map(x => x)
          },
        },
      },
    })

    DataModel.deserialize(Panda, {})
  })

  it('fail if type is missing', async () => {
    let err: CustomError
    try {
      DataModel.deserialize(Panda, { fox: 1, date: '2020-01-01' })
    } catch (e) {
      err = e
    }

    // TODO review
    // expect(err.name).toMatch(/DataModelError/)
    expect(err.code).toBe('invalid-type')
    expect(DataModelError.invalidType.is(err)).toBe(true)
  })
})

describe('#draft', () => {
  it('x tell unknown props', async () => {
    class Panda {
      one
      two
      pass
    }

    DataModel.decorate(Panda, {
      properties: {
        one: null,
        pass: {
          require: true,
          parse(x) {
            if (x.value.length < 8) {
              // 'password too short'
              x
            }
          },
        },
      },
    })

    let res = DataModel.parse(Panda, { one: 1, three: 3 }, { strict: true })
    console.log({ res })
  })

  // TODO migrations? of type, of field rename.., of .version bump?
  it('x', async () => {
    class Login {
      name
      pass
      date: Date
    }

    DataModel.decorate(Login, {
      properties: {
        //bar: null,
        name: {
          parse(x) {
            console.log({ x })
          },
        },
        date: {
          parse(x) {
            x.value = new Date(x.value)
          },
        },
      },
    })

    let res = DataModel.deserialize(Login, { foo: 1, date: '2020-01-01' })
    console.log(res)
  })

  it.skip('x decorator', async () => {
    function f(key: string): any {
      throw Error('boom')
      console.log('evaluate: ', key)
      return function () {
        console.log('call: ', key)
      }
    }

    class C {
      @f('Static Property')
      static prop?: number
    }

    //new C()
  })

  it('x', async () => {
    class Panda {
      _sanitized
      tags: string[]
    }

    DataModel.decorate(Panda, {
      properties: {
        tags: {
          parse(ctx) {
            console.log(ctx.model)
            ctx.value = ctx.input.split(',')
            ctx.model._sanitized = true

            // @ts-expect-error TEST
            ctx.model.bogus
          },
        },
      },
    })

    let res = DataModel.deserialize(Panda, { tags: 'a,b' })
    expect(res._sanitized).toBe(true)
    expect(res.tags).toEqual(['a', 'b'])

    // TEST other way to create ???
    let panda = Panda
    // DataModel.applyDocument(panda, {tags: 'a,b'})
  })

  it('x #todo', async () => {
    let sut = DataModel.from(Panda)
    let res = sut.applyDocument({ fox: 2 })
    sut.onEachProperty({
      type: null,
      fox: null,
      date: null,
    })
  })
}) // #draft
