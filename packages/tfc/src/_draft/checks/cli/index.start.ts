import fs from 'fs'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { LintHandler } from '../_draft/LintNpmPackageJsonHandler.js'
import { ConfigData } from '../IssueSuite.js'

// Required to emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define CLI options with yargs
const argv = await yargs(hideBin(process.argv))
  .option('spec', {
    alias: 's',
    type: 'string',
    describe: 'Path to the spec file',
    demandOption: true,
  })
  .option('write', {
    alias: 'w',
    type: 'string',
    describe: 'Write changes',
    // demandOption: true,
  })
  .option('fix', {
    alias: 'f',
    array: true,
    // type: 'string',
    describe: 'Fix rule',
    // demandOption: true,
  })

  .help().argv

const specs = {
  // npm: import.meta.resolve('../_draft/LintNpmPackageJsonHandler.ts'),
  npm: () => import('../_draft/LintNpmPackageJsonHandler.js'),
}
// Object.keys(specs).forEach(key => {
//   specs[key] = specs[key].replace(/^file:\/\//, '')
// })

class LintApp {
  async execute() {
    let specPath: string
    specPath = path.resolve(__dirname, argv.spec)
    let spec
    if (fs.existsSync(specPath)) {
      spec = await import(specPath)
    } else {
      // console.error(`Spec file not found: ${specPath}`)

      let load = await specs[argv.spec]?.()
      if (!load) {
        console.log('Could not find spec', {
          spec: argv.spec,
          keys: Object.keys(specs),
        })
        return { exitCode: 1 }
      }
      spec = load
    }

    let handler = new spec.default({ dir: process.cwd() }) as LintHandler

    // console.log('Loaded spec file:\n', spec)
    let suite = await handler.setup()

    let conf: ConfigData = {
      issues: {
        publish: {
          enabled: false,
          level: 'warning',
        },
      },
    }

    handler.suite._config = conf

    await suite.executeForShell()
    if (argv.write) {
      await handler.write()
    }
  }
}

let app = new LintApp()
let res = await app.execute()
process.exitCode = res?.exitCode
