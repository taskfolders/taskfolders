import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'

export class LintNpmPackageHandler {
  constructor(public params: { dir: string }) {}
  async execute() {
    let file = Path.join(this.params.dir, 'package.json')
    let doc = JSON.parse(await fs.readFile(file, 'utf-8')) as {
      name
      private?
      repository?
      type?: 'module'
      engines: {
        node?: string
      }
    }

    let sut = new IssueSuite()
    sut.log.info('Start linting', file)
    let { test } = sut

    test('esm', t => {
      if (doc.type !== 'module') {
        return t.warn('Not ESM')
      }
    })

    test('vscode', t => {
      t.skip('todo')
    })

    test('name', t => {
      if (doc['workspaces']?.length > 0) {
        // ??
      } else {
        if (!doc.name?.test?.(/^@.*\//)) {
          t.error('missing @scope')
          return
          //throw Error('missing @scope')
        } else {
          return t.skip('no subpackage')
        }
      }
    })

    test('engine', t => {
      if (!doc.engines?.node) {
        t.warn('No engine specified')
        t.fix({
          title: 'define engine field',
          after: { engines: { node: '>=22.0' } },
        })
        return
      }
    })

    test('publish', t => {
      if (doc.private === undefined) {
        t.error('Package does not specify if it is private or public')

        t.fix({
          code: 'private',
          title: 'Make package private',
          before: doc,
          after: { ...doc, private: true },
        })
        t.fix({
          code: 'public',
          title: 'Add configuration to publish package',
          before: doc,
          after: { ...doc, private: false, repository: 'git...' },
        })
        return
      }

      if (doc.private === true) return

      if (!doc.repository) {
        return t.error('no repository')
      }
    })

    test('dev-misplaced', t => {
      let devOnly = ['vitest', 'eslint', 'webpack']
      t.skip('todo')
    })

    await sut.executeForShell()
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
