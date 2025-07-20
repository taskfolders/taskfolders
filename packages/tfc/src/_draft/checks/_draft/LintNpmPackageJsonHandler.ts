import * as Path from 'node:path'
import { IssueSuite } from '../IssueSuite.js'
import fs from 'fs/promises'
import { isRunFromShell } from '../../isRunFromShell.js'
import { $dev, log } from '../../../dc.js'
import { diff } from './diff.js'
import { createPatch } from 'diff'
import * as Color from 'colorette'

type NpmPackage = {
  name
  private?
  repository?
  dependencies?: string[]
  devDependencies?: Record<string, any>
  type?: 'module'
  engines: {
    node?: string
  }
}

class BaseHandler {
  params: Record<string, unknown>
  execute: () => void | Promise<void>
}

export class LintHandler extends BaseHandler {
  suite: IssueSuite
  setup
  write
}

export class LintNpmPackageHandler implements LintHandler {
  before: NpmPackage
  packageDoc: NpmPackage
  suite: IssueSuite

  constructor(public params: { dir: string }) {}

  async execute() {
    let suite = await this.setup()
    await suite.executeForShell()
  }

  async setup() {
    let file = Path.join(this.params.dir, 'package.json')
    let packageDoc = JSON.parse(await fs.readFile(file, 'utf-8')) as NpmPackage
    this.packageDoc = packageDoc
    this.before = JSON.parse(JSON.stringify(packageDoc))

    let suite = new IssueSuite()
    suite.log.dev({ file, dir: this.params.dir })
    suite.log.info('Start linting', file)
    let { test } = suite

    test('esm', t => {
      if (packageDoc.type !== 'module') {
        return t.warn('Not ESM')
      }
    })

    test('vscode', t => {
      t.skip('todo')
    })

    test('name', t => {
      if (packageDoc['workspaces']?.length > 0) {
        return t.skip('no subpackage')
        // ??
      } else {
        if (!packageDoc.name?.match?.(/^@.*\//)) {
          t.fail('missing @scope')
          return
        }
      }
    })

    test('engine', t => {
      t.log.dev('at engine-1')

      if (!packageDoc.engines?.node) {
        t.warn('No engine specified')
        t.fix({
          title: 'define engine field',
          after: { engines: { node: '>=22.0' } },
        })
        return
      }
    })

    test('publish', t => {
      if (packageDoc.private === undefined) {
        t.fail('Package does not specify if it is private or public')

        t.fix({
          code: 'private',
          title: 'Make package private',
          before: packageDoc,
          after: { ...packageDoc, private: true },
        })
        t.fix({
          code: 'public',
          title: 'Add configuration to publish package',
          before: packageDoc,
          after: { ...packageDoc, private: false, repository: 'git...' },
        })
        return
      }

      if (packageDoc.private === true) return

      if (!packageDoc.repository) {
        return t.fail('no repository')
      }
    })

    test('dev-misplaced', async t => {
      let devOnly = ['vitest', 'eslint', 'webpack']
      let prodKeys = Object.keys(packageDoc.dependencies)
      let types = prodKeys.filter(x => x.startsWith('@types/'))
      let devs = [...types]
      if (types.length) {
        t.fail({
          title: '@type packages should be defined as dev dependency',
          data: { types },
        })
      }

      if (devs.length) {
        await t.fix({
          code: 'move-into-dev',
          // before: doc,
          // after: { ...doc, private: true },
          execute(ctx) {
            // ctx.log.put('Hello')
            // ctx.log.dev('Hello')
            packageDoc.devDependencies ??= {}
            for (let key of devs) {
              packageDoc.devDependencies[key] = packageDoc.dependencies[key]
              delete packageDoc.dependencies[key]
            }
            packageDoc.devDependencies = sortObject(packageDoc.devDependencies)
          },
        })
      }

      let a1 = ['@eslint', 'webpack']
      let shouldBeDev = prodKeys.filter(x => {
        if (a1.some(key => x.startsWith(key))) return true
      })
    })

    this.suite = suite
    return suite
  }

  async write() {
    let before = JSON.stringify(this.before, null, 2)
    let after = JSON.stringify(this.packageDoc, null, 2)
    // this.suite.log.dev('Write changes...').dev(this.packageDoc)
    let txt = diff({ before, after, type: 'lines' })

    txt = createPatch('file.txt', before, after, 'old version', 'new version', {
      context: 1,
    })

    txt = txt
      .split('\n')
      .map(line => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          return Color.green(line)
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          return Color.red(line)
        } else if (line.startsWith('@@')) {
          return Color.cyan(line)
        } else if (line.startsWith('---') || line.startsWith('+++')) {
          return Color.yellow(line)
        } else {
          return line
        }
      })
      .join('\n')

    this.suite.log.dev('Write changes...').put(txt)
  }
}

const sortObject = obj =>
  Object.fromEntries(
    Object.entries(obj).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  )

// if (isRunFromShell(import.meta.url)) {
//   let dir = process.argv[2]
//   if (dir && dir.includes('..')) {
//     dir = Path.resolve(dir)
//   } else {
//     dir = process.cwd()
//   }

//   new LintNpmPackageHandler({ dir }).execute()
// }

export default LintNpmPackageHandler
