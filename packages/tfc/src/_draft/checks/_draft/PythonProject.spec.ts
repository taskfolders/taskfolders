import { expect, describe, it } from 'vitest'
import { LintHandler } from './LintHandler.js'
import { load } from 'js-toml'
import { readFileSync } from 'fs'
import { IssueSuite } from '../IssueSuite.js'

class PythonProjectHandler extends LintHandler {
  suite = new IssueSuite()
  constructor(public params: { dir: string }) {
    super()
  }

  async testPath(path: string) {
    return path.endsWith('pyproject.toml')
  }

  async execute() {
    let body = readFileSync('/tmp/pyproject.toml', 'utf-8')
    let doc = load(body) as {
      tool: { hatch: { envs: Record<string, { path: string }> } }
      'build-system': any
    }
    let { suite } = this
    suite.test('x', t => {
      if (doc.tool.hatch.envs.default.path !== '.venv') {
        t.fail()
      }
      let st = doc['build-system']
      if (!st) {
        t.fail('No build-system found')
      } else {
        // requires = ["hatchling"]
        // build-backend = "hatchling.build"
      }
    })
    await suite.execute_v2()
  }
}

it('x', async () => {
  let sut = new PythonProjectHandler({ dir: '/tmp' })
  await sut.execute()
})
