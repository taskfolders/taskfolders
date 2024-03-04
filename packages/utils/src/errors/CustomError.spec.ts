import { expect, describe, it } from 'vitest'

import { CustomError, GetErrorData } from './CustomError.js'
import { expectType } from '../types/expectType.js'

it('x', () => {
  class MyError extends CustomError<{ delta }> {
    message = 'Custom error'
    name = 'MyError'
    static code = 'invalid-type'
    value: number

    static create(val: number) {
      let next = new this('some message')
      next.value = val
      return next
    }
  }

  let e1 = new MyError()
  let e2 = new Error('boom')
  expect(MyError.is(e1)).toBe(true)
  expect(MyError.is(e2)).toBe(false)

  type foo = GetErrorData<MyError>
})

describe('error group', () => {
  it('create error group', async () => {
    const PandaError = CustomError.defineGroup('PandaError', {
      invalid: class InvalidError extends CustomError {
        message = 'Something invalid'
        expected: string
      },
      unknown: class extends CustomError<{ delta: number }> {
        message = 'Unknown source'
        source: string
        static fromData(kv: { delta }) {
          let obj = new this()
          obj.data = kv
          return obj
        }
      },
    })

    expect(PandaError.invalid.code).toBe('invalid')
    let e1 = new PandaError.invalid()
    expect(PandaError.invalid.name).toBe('InvalidError')
    expect(PandaError.invalid.code).toBe('invalid')

    expect(e1.name).toBe('PandaError')
    expect(e1.code).toBe('invalid')
    expect(PandaError.invalid.is(e1)).toBe(true)
    expect(PandaError.invalid.is(new Error('Boom'))).toBe(false)

    let e2 = new PandaError.invalid()
    expect(PandaError.unknown.name).toBe('unknown')
    PandaError.unknown.fromData({ delta: 1 })

    let e3 = PandaError.unknown.create({ delta: 1 })
    expect(e3.data).toEqual({ delta: 1 })
    type foo = GetErrorData<typeof PandaError.unknown>
    expectType<foo, { delta: number }>()
  })

  it('override default code', async () => {
    const PandaError = CustomError.defineGroup('PandaError', {
      invalidType: class InvalidError extends CustomError {
        static code = 'my-own-code'
      },
      bogusType: class InvalidError extends CustomError {},
    })
    expect(PandaError.invalidType.code).toBe('my-own-code')
    expect(PandaError.bogusType.code).toBe('bogus-type')
  })
})
