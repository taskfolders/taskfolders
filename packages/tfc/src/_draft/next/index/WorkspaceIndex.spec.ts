import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from './WorkspaceIndex.js'
import { join } from 'path/posix'
import * as fs from 'fs'
import { SectionSummary } from '../scan/parseMarkdownSections.js'

// TODO mock stat.mtime
it.skip('x', async () => {
  let sut = new WorkspaceIndex({ path: '/tmp/app' })
  sut.pathBaseDir = '/tmp'
  sut.updateFile('one/foo.md', { sid: 'one' })
  let res = sut.get('/tmp/one/foo.md')
  // console.log(res)
})

it('x read one #scaffold #live', async () => {
  let baseDir = join(process.env.HOME, 'work/fgo/demo-ws')
  let indexDir = join(baseDir, '_data/taskfolders.com')
  let sut = await WorkspaceIndex.fromDir({ baseDir, indexDir })

  // let r1 = sut.get('action/now-fgo/index.md')
  let r1 = sut.get('demo/index.md')
  let r2 = sut.data
  // console.log({ ...r1 })
  // console.log(sut.data.paths['demo/index.md'])
  let r3 = sut.findByReference('panda')
})

it.skip('x process one #scaffold #live', async () => {
  let path = join(process.env.HOME, 'work/fgo')
  let sut = new WorkspaceIndex({ path })
  sut.pathBaseDir = path
  sut.updateFile('demo/index.md', { sid: 'one', after: 2026 })

  console.log(sut.data)
  // console.log(sut.toJSON())
})

it('x', async () => {
  let sut = new WorkspaceIndex({ path: '/app' })
  sut.fs = {
    statSync() {
      return { ino: 1, mtime: new Date() }
    },
  } satisfies { [k in keyof typeof fs]?: any } as any

  sut.pathBaseDir = '/app'
  sut.updateFile('one.md', { sid: 'one', after: 2026, done: true })
  sut.updateFile('two.md', { after: 'tango' })

  sut._refreshIndex()
  let res = sut.findByReference('one')
  console.log(sut)

  // console.log(sut.toJSON())
})

it('x upsert sections', async () => {
  let sut = new WorkspaceIndex({ path: '/app' })
  sut.fs = {
    statSync() {
      return { ino: 1, mtime: new Date() }
    },
  } satisfies { [k in keyof typeof fs]?: any } as any

  sut.pathBaseDir = '/app'
  let sections: SectionSummary[] = [
    { type: 'todo', title: 'one task', lineNumber: 32 },
  ]
  sut.updateFile('one.md', { sid: 'one', after: 2026, done: true, sections })

  console.log(sut.toJSON())
})

it('x - load from JSON sample #focus', async () => {
  let sample = JSON.stringify({
    type: 'draft/workspace-index/1',
    version: 1,
    paths: {
      'action/now/index.md': {
        sid: 'now-tasks',
        uid: 'uid-001',
        after: '2026-03-01T00:00:00.000Z',
        tags: ['project', 'active'],
        flags: ['star'],
        sections: [{ uid: 'sec-1', lineText: '## Next steps' }],
        sections_v2: [{ type: 'todo', title: 'ship feature', lineNumber: 10 }],
      },
      'waiting/blocked.md': {
        sid: 'blocked-item',
        before: '2026-06-01T00:00:00.000Z',
        tags: ['waiting'],
        sections: [],
        sections_v2: [],
      },
    },
    items: [],
  })

  let sut = WorkspaceIndex.fromJSON(sample, { path: '/app' })
  sut.pathBaseDir = '/app'

  // Verify paths loaded
  expect(Object.keys(sut.data.paths)).toEqual([
    'action/now/index.md',
    'waiting/blocked.md',
  ])

  // Verify date parsing
  let first = sut.data.paths['action/now/index.md']
  expect(first.after).toBeInstanceOf(Date)
  expect(first.sid).toBe('now-tasks')
  expect(first.tags).toEqual(['project', 'active'])

  let second = sut.data.paths['waiting/blocked.md']
  expect(second.before).toBeInstanceOf(Date)

  // Verify index lookups
  let bySid = sut.findByReference('now-tasks')
  expect(bySid).toBeDefined()
  expect(bySid.path).toBe('action/now/index.md')

  let byUid = sut.findByReference('uid-001')
  expect(byUid).toBeDefined()
  expect(byUid.path).toBe('action/now/index.md')

  // Verify unknown reference returns undefined
  let missing = sut.findByReference('does-not-exist')
  expect(missing).toBeUndefined()

  let res = sut.toJSONFull()
  console.log('yoo')
  console.dir(res)
})

it('x - toJSONFull includes _index with sid and uid maps', async () => {
  let sample = JSON.stringify({
    type: 'draft/workspace-index/1',
    version: 1,
    paths: {
      'action/now/index.md': {
        sid: 'now-tasks',
        uid: 'uid-001',
        after: '2026-03-01T00:00:00.000Z',
        tags: ['project'],
        sections: [],
        sections_v2: [{ type: 'todo', title: 'ship feature', lineNumber: 10 }],
      },
      'waiting/blocked.md': {
        sid: 'blocked-item',
        uid: 'uid-002',
        sections: [],
        sections_v2: [],
      },
      'notes/plain.md': {
        sections: [],
        sections_v2: [],
      },
    },
    items: [],
  })

  let sut = WorkspaceIndex.fromJSON(sample, { path: '/app' })
  sut.pathBaseDir = '/app'

  let result = sut.toJSONFull()

  expect(result._index).toEqual({
    sid: {
      'now-tasks': 'action/now/index.md',
      'blocked-item': 'waiting/blocked.md',
    },
    uid: {
      'uid-001': 'action/now/index.md',
      'uid-002': 'waiting/blocked.md',
    },
  })

  // Also contains the regular toJSON fields
  expect(result.type).toBe('draft/workspace-index/1')
  expect(result.version).toBe(1)
  expect(result).not.toHaveProperty('items')
})
