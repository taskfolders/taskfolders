import { expect, describe, it } from 'vitest'

import { CustomError } from './CustomError.js'

it('x', () => {
  class MyError extends CustomError {
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
})

it('create error group', async () => {
  const PandaError = CustomError.defineGroup('PandaError', {
    invalid: class InvalidError extends CustomError {
      message = 'Something invalid'
      expected: string
    },
    unknown: class extends CustomError {
      message = 'Unknown source'
      source: string
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
})
