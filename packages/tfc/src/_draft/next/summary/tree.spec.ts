import { expect, describe, it } from 'vitest'
import { PathItem } from './PathItem.js'
import {
  dropTreeNotStarted,
  flattenTree,
  flatToListTree,
  Input,
  Output,
} from './tree.js'

it.skip('x ', async () => {
  let now = new Date('2025-02')
  let a1 = [
    new PathItem({ pathRelative: 'one/foo/three/deeper/one/two' }),
    new PathItem({ pathRelative: 'one/foo/three', after: new Date('2025-03') }),
    new PathItem({ pathRelative: 'one' }),
    new PathItem({ pathRelative: 'two/tango' }),
  ]
  let r2 = a1.map(x => {
    return { path: x.pathRelative, item: x }
  })

  const tree = flatToListTree(r2)
  // console.log(JSON.stringify(tree, null, 2))
  // console.log(tree)
  expect(tree.length).toBe(2)
  expect(tree[0].path).toBe('one')
  expect(tree[1].path).toBe('two/tango')
  expect(tree[0].children[0].path).toBe('one/foo/three')
  expect(tree[0].children[0].children.length).toBe(1)
  expect(tree[0].children[0].children[0].path).toBe(
    'one/foo/three/deeper/one/two',
  )
  // console.dir(tree, { depth: 5, customInspect: true })

  dropTreeNotStarted(tree, now)
  expect(tree[0].children[0].children.length).toBe(0)
  // console.dir(tree, { depth: 5, customInspect: true })

  let r1 = flattenTree(tree, { now }).map(x => x.path)
  expect(r1).toEqual(['one', 'one/foo/three', 'two/tango'])
  // console.dir(acu, { depth: 5, customInspect: true })
})
