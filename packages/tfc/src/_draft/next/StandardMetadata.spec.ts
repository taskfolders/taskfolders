import { expect, describe, it } from 'vitest'
import { StandardMetadata } from './StandardMetadata.js'

it('x', async () => {
  let sut = new StandardMetadata({ tags: 'one' })
  expect(sut.tags).toEqual(['one'])

  sut = new StandardMetadata({ flags: 'workspace' })
  expect(sut.flags).toContain('workspace')

  sut = new StandardMetadata({ review: { next: '2025-01-01' } })
  expect(sut.review.next).toBeCloseTo(new Date('2025-01-01'))
})
