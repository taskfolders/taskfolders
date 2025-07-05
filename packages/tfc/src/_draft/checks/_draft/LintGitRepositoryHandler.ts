/**
 * @uid 1904eaf3-d96e-4fca-9b91-de1ca99f0403
 * @tags handler, beta
 */

import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'

export class LintGitRepositoryHandler {
  suite: IssueSuite
  file: string

  constructor(public params: { dir }) {}

  async execute() {
    let { file, suite } = this

    await this.setup()
    suite.log.info('Start linting', file)
    await suite.execute()
  }

  async setup() {
    let file = Path.join(process.env.HOME, 'repos/tf-open')
    this.file = file

    let doc = JSON.parse(await fs.readFile(file, 'utf-8'))

    let sut = new IssueSuite()
    let { test, skip } = sut

    test('esm', t => {
      console.log('hello')
    })

    this.suite = sut
  }
}

if (isRunFromShell(import.meta.url)) {
  new LintGitRepositoryHandler({ dir: process.cwd() }).execute()
}
