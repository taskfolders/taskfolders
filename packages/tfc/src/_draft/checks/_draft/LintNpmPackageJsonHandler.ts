import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'
import { log } from '../../../dc.js'

export class LintNpmPackageHandler {
  constructor(public params: { dir: string }) {}
  async execute() {
    let file = Path.join(this.params.dir, 'package.json')
    let doc = JSON.parse(await fs.readFile(file, 'utf-8')) as {
      name
      private?
      repository?
      dependencies?: string[]
      devDependencies?: string[]
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
        return t.skip('no subpackage')
        // ??
      } else {
        if (!doc.name?.match?.(/^@.*\//)) {
          t.fail('missing @scope')
          return
        }
      }
    })

    test('engine', t => {
      console.log('at engine-1')
      t.log.put('at engine-1')

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
        t.fail('Package does not specify if it is private or public')

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
        return t.fail('no repository')
      }
    })

    test('dev-misplaced', t => {
      let devOnly = ['vitest', 'eslint', 'webpack']
      let prodKeys = Object.keys(doc.dependencies)
      let types = prodKeys.filter(x => x.startsWith('@types/'))
      t.fail({
        title: '@type packages should be defined as dev dependency',
        data: { types },
      })

      let a1 = ['@eslint', 'webpack']
      let shouldBeDev = prodKeys.filter(x => {
        if (a1.some(key => x.startsWith(key))) return true
      })
      // log.dev({ shouldBeDev })
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
