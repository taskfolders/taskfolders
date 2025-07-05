import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'

export class LintNpmPackageHandler {
  constructor(public params: { dir: string }) {}
  async execute() {
    let file = Path.join(this.params.dir, 'package.json')
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
        // ??
      } else {
        if (!doc.name?.test?.(/^@.*\//)) {
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
  let dir = process.argv[2]
  if (dir && dir.includes('..')) {
    dir = Path.resolve(dir)
  } else {
    dir = process.cwd()
  }

  new LintNpmPackageHandler({ dir }).execute()
}
