import { expect, describe, it } from 'vitest'
import { StandardMetadata } from './StandardMetadata.js'
import { parse, parseISO } from 'date-fns'
import { toDate } from './toDate.js'

it('x', async () => {
  let sut = new StandardMetadata({ tags: 'one' })
  expect(sut.tags).toEqual(['one'])

  sut = new StandardMetadata({ flags: 'workspace' })
  expect(sut.flags).toContain('workspace')
})

it('x', async () => {
  let sut = new StandardMetadata({ before: '2025-01-07' })
  expect(sut.before).toBeCloseTo(new Date('2025-01-07').getTime())

  sut = new StandardMetadata({ after: '2025-01-04' })
  expect(sut.after).toBeCloseTo(new Date('2025-01-04').getTime())
})

it('flags', async () => {
  let sut = new StandardMetadata({ flags: 'workspace' })
  expect(sut.flags).toContain('workspace')

  sut = new StandardMetadata({ flags: 'workspace, now' })
  expect(sut.flags).toContain('workspace')

  sut = new StandardMetadata({})
  expect(sut.flags).toEqual([])
})

it('serialize', async () => {
  let sut = new StandardMetadata({
    title: 'demo',
    fox: 1,
    after: '2025-jan',
    flags: 'one',
  })
  let doc = JSON.parse(JSON.stringify(sut))

  expect(doc).toEqual({
    title: 'demo',
    fox: 1,
    // preserve date
    after: '2025-jan',
    flags: ['one'],
  })
})
