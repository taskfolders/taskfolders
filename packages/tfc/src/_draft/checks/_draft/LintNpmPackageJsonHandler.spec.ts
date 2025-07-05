import { expect, describe, it } from 'vitest'
import { LintNpmPackageHandler } from './LintNpmPackageJsonHandler.js'
import Path from 'path'
import { diffChars, diffLines } from 'diff'

it('x', async () => {
  let dir = Path.join(process.env.HOME, 'repos/tf-open')
  let sut = new LintNpmPackageHandler({ dir })
  sut.execute()
})

it.skip('x', async () => {
  let doc = { fox: 1, tango: 2 }
  let before = JSON.stringify(doc, null, 2)
  let after = JSON.stringify({ ...doc, private: true }, null, 2)
  after = JSON.stringify({ fox: 1, private: true, tango: 2 }, null, 2)

  // Perform line-level diff
  let changes = diffLines(before, after)
  changes = diffChars(before, after)
  console.log(changes)
  console.log(before)
})
