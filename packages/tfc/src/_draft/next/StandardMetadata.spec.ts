import { expect, describe, it } from 'vitest'
import { StandardMetadata } from './StandardMetadata.js'
import { parse, parseISO } from 'date-fns'
import { toDate } from './toDate.js'
import { log } from 'node:console'
import { TimeMark } from './TimeMark.js'

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
    flags: 'one',
  })

  expect(sut.flags).toEqual(['one'])
  expect(doc.flags).toEqual('one')

  sut.flags = ['now-dir', 'workspace']
  expect(sut.flags).toEqual(['now-dir', 'workspace'])
  doc = JSON.parse(JSON.stringify(sut))
  expect(doc.flags).toEqual(['now-dir', 'workspace'])
})

it('x raw vs view', async () => {
  let sut = new StandardMetadata({
    tags: 'one,two',
  })
  expect(sut.toJSON()).toEqual({ tags: 'one,two' })
  expect(sut.tags).toEqual(['one', 'two'])

  // @ts-expect-error TEST
  sut.tags.push('alien')
  sut.tags = [...sut.tags, 'three']
  expect(sut.tags).toEqual(['one', 'two', 'three'])
  expect(sut.toJSON()).toEqual({ tags: ['one', 'two', 'three'] })
})

it('x forward', async () => {
  let sut = new StandardMetadata({
    title: 'panda',
    fox: 'tango',
  })
  expect(sut.title).toBe('panda')
  expect(
    // @ts-expect-error TEST unknown but defined property
    sut.fox,
  ).toBe('tango')
})

it('x after #todo #now', async () => {
  let sut = new StandardMetadata({
    after: '2025-01-01',
    after_v2: '2025-01-01',
  })

  expect(sut.after).toBeCloseTo(new Date('2025-01-01').getTime())
  expect(sut.after).toBeInstanceOf(Date)
  expect(sut.after_v2).toBeInstanceOf(TimeMark)

  sut = new StandardMetadata({
    after: '2025-W01',
  })
  return
  expect(sut.after).toBeCloseTo(new Date('2025-01-01').getTime())

  sut = new StandardMetadata({
    after: '2025-W02',
  })
  expect(sut.after).toBeCloseTo(new Date('2025-01-08').getTime())
})
