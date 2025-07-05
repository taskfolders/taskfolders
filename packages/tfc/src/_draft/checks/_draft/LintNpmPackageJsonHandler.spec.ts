import { expect, describe, it } from 'vitest'
import { LintNpmPackageHandler } from './LintNpmPackageJsonHandler.js'
import Path from 'path'

it.only('x', async () => {
  let dir = Path.join(process.env.HOME, 'repos/tf-open')
  let sut = new LintNpmPackageHandler({ dir })
})
