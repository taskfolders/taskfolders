import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { LintHandler } from '../_draft/LintNpmPackageJsonHandler.js'

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

// Resolve and read the spec file
const specPath = path.resolve(__dirname, argv.spec)

if (!fs.existsSync(specPath)) {
  console.error(`Spec file not found: ${specPath}`)

  // eslint-disable-next-line n/no-process-exit
  process.exit(1)
}

let spec = await import(specPath)
let handler = new spec.default({ dir: process.cwd() }) as LintHandler
// console.log('Loaded spec file:\n', spec)
let suite = await handler.setup()
await suite.executeForShell()
if (argv.write) {
  await handler.write()
}
