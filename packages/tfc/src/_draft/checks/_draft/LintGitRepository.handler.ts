import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'

export class LintGitRepositoryHandler {
  async execute() {
    let file = Path.join(
      process.env.HOME,
      'repos/tf-open/packages/tfc/package.json',
    )
    let doc = JSON.parse(await fs.readFile(file, 'utf-8'))

    let sut = new IssueSuite()
    sut.log.info('Start linting', file)
    let { test, skip } = sut

    test('esm', t => {
      console.log('hello')
    })

    let res = await sut.execute()
  }
}

if (isRunFromShell(import.meta.url)) {
  new LintGitRepositoryHandler().execute()
}
