import { expect, describe, it } from 'vitest'

it('pass 1', async () => {
  console.log('hello in test')
})

it.skip('skip 1', async () => {})
it.skip('skip 2', async () => {})
it('pass 2', async () => {
  //
})

it('pass 3 #-now', async () => {
  //
})

describe('second suite', () => {
  it('test ok 1', async () => {
    console.log('some stdout message')
  })

  it.skip('test fail 1', async () => {
    throw Error('boom')
  })

  describe('child 1', () => {
    it('test ok 2 #foo tag', async () => {
      console.error('some stderr message')
    })
  })
})
