import { expect, describe, it } from 'vitest'
import { LintNpmPackageJsonHandler } from './LintNpmPackageJsonHandler.js'
import Path from 'path'

it('x', async () => {
  let dir = Path.join(process.env.HOME, 'repos/tf-open')
  let sut = new LintNpmPackageJsonHandler()
})
