/**
 * @uid 1904eaf3-d96e-4fca-9b91-de1ca99f0403
 * @tags handler, beta
 */

import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import fsSync from 'fs'
import { isRunFromShell } from '../../isRunFromShell.js'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'

export class LintGitRepositoryHandler {
  suite: IssueSuite
  file: string

  constructor(public params: { dir }) {
    this.setup()
  }

  async execute() {
    let { file, suite } = this

    suite.log.info('Start linting', file)
    await suite.executeForShell()
  }

  setup() {
    let file = Path.join(process.env.HOME, 'repos/tf-open')
    this.file = file

    // let doc = JSON.parse(await fs.readFile(file, 'utf-8'))

    let sut = new IssueSuite()
    let { test } = sut

    test('pre-commit', async t => {
      let res = await findUpAll({
        startFrom: process.cwd(),
        test: x => {
          let dir = Path.join(x, '.git')
          let has = fsSync.existsSync(dir)
          if (has) return x
        },
      })
      let found = res.at(0)
      if (!found) throw Error('No git repository found')
      let preCommit = Path.join(found, '.git/hooks/pre-commit')
      if (!(await fs.exists(preCommit))) {
        t.error('No pre-commit hook installed')
        t.fix('Install pre-commit')
        t.fix('Install LeftHook')
      }
    })

    test('short feature branch', t => {})

    this.suite = sut
  }
}

if (isRunFromShell(import.meta.url)) {
  new LintGitRepositoryHandler({ dir: process.cwd() }).execute()
}
