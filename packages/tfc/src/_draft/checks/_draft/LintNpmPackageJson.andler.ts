import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'

export class LintNpmPackageJsonHandler {
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
      if (doc.type !== 'module') {
        return t.warn('Not ESM')
      }
    })

    test('name', t => {
      if (doc['workspaces']?.length > 0) {
        if (!doc['name'].test(/^@.*\//)) {
          throw Error('missing @scope')
        } else {
          return t.skip('no subpackage')
        }
      }
    })
    let res = await sut.execute()
  }
}

if (isRunFromShell(import.meta.url)) {
  new LintNpmPackageJsonHandler().execute()
}
