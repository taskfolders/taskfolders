import { findWorkspaceUp } from '../findWorkspaceUp.js'
import {
  TaskFoldersMarkdown,
  MarkdownDocument,
} from '@taskfolders/utils/markdown'
import { join, relative } from 'node:path'

import { expect, describe, it } from 'vitest'
import { ScanV2Handler } from './scan/ScanV2.handler.js'
import { StandardMetadata } from './StandardMetadata.js'
import { parseWorkspaceIndex } from './summary/parseWorkspaceIndex.js'
import { dedent } from '@taskfolders/utils/native/string/dedent'
import { TimeMarker } from '@taskfolders/utils/native/date/TimeMarker'
import { TimeMark } from './TimeMark.js'

it.skip('x', async () => {
  let data = {
    review: {
      title: 'Review',
    },
    calendar: [{ title: 'Meeting one', date: '2023-10-01' }],
    events: [{ title: 'Meeting three', date: '2023-10-01' }],
  }
  let sut = new StandardMetadata(data)
  console.log(sut.tags)
})

it.skip('x y #todo #slow #scaffold', async () => {
  let dir = join(process.env.HOME, 'repos/tf-open/packages/tfc/samples/one')
  dir = join(process.env.HOME, 'repos/play/demo/one')

  let s1 = new ScanV2Handler({ dir })
  let result = await s1.execute()

  let { index } = result
  expect(
    index.find({
      uid: 'aaf32c4f-a39a-420f-bff9-ba217f5825b9',
    }),
  ).toEqual({ path: 'panda/foo.md', type: 'path' })

  expect(index.find({ uid: '1f79112d-e7ee-466e-a429-6c1b8df2495f' })).toEqual({
    path: 'one/secret.md.asc',
    type: 'section',
  })

  let two = index.data.paths['two/index.md']
  expect(two.calendar[0].date.toISOString()).toBe('2024-02-26T00:00:00.000Z')

  let blob = await parseWorkspaceIndex(index, {
    basePath: null,
    wsName: 'demo',
  })

  console.log(blob)

  // s1.log.info({ index })
  //sut.parse()
  //sut.findBase()
})

const sanitizeMarkdown = (md: MarkdownDocument) => {
  let std = new StandardMetadata(md.data)
  let fixes: Partial<any> = {}
  if (std.after) {
    let now = new Date('2025-01-01')
    let marker = TimeMarker.from('3w', { now })
    if (marker.isSanitized) {
      std._raw.after = marker.final
      fixes['after'] = marker.final
    }
  }
  md.data = std.toJSON()
  // md.data.fox = 2
  return { markdown: md, fixes }
}

it('x edit md with time updates', async () => {
  let body = dedent`
    fox: 1
    after: 3w
    
    hi
  `
  let md = await MarkdownDocument.fromBody<any>(body, {
    implicitFrontmatter: true,
  })

  let r1 = sanitizeMarkdown(md)

  let lines = r1.markdown.toString().split('\n')
  // console.log(lines)
  expect(lines).toEqual(['---', 'fox: 1', 'after: 2025-W04', '---', '', 'hi'])
})
