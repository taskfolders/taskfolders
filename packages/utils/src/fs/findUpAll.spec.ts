import { expect, describe, it } from 'vitest'
import { findUpAll } from './findUpAll.js'
import { Volume } from 'memfs'

it('find up all files matching name', async () => {
  const vol = Volume.fromJSON({
    '/app/one/two/package.json': '{}',
    '/app/package.json': '{}',
  })

  let all = findUpAll({
    fs: vol as any,
    startFrom: '/app/one/two/deep',
    findName: 'package.json',
  })

  expect(all).toEqual(['/app/one/two/package.json', '/app/package.json'])
})
