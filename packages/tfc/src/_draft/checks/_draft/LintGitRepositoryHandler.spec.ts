import { expect, describe, it } from 'vitest'
import { LintGitRepositoryHandler } from './LintGitRepositoryHandler.js'
import * as Path from 'path'

it('x', async () => {
  let dir = Path.join(process.env.HOME, 'repos/tf-open')
  let sut = new LintGitRepositoryHandler({ dir })
  await sut.setup()
  await sut.suite.execute()
})
