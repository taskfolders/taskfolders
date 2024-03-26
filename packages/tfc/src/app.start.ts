import { $dev } from '@taskfolders/utils/logger'
import '@taskfolders/utils/logger/node/register.start'
import 'source-map-support/register.js'
import Yargs from 'yargs'
import * as Path from 'node:path'
import { TfcApp } from './TfcApp.js'

let app = new TfcApp()
app.executeCli()

//cli.demandCommand(1, 'Please specify a command').help().argv

function main() {
  let cli = Yargs()
    .scriptName('tfc')
    .strict(true)
    // .usage('Usage: $0 <command> [options]')
    .command({
      command: 'foo [path]',
      describe: 'scan folder content',
      builder: {
        num2: {
          describe: 'Second number',
          type: 'number',
        },
        all: {
          boolean: true,
        },
        index: {
          boolean: true,
        },
        convert: {
          boolean: true,
        },
        fix: {
          boolean: true,
        },
        diff: {
          boolean: true,
        },
        'dry-run': {
          alias: 'n',
          boolean: true,
          // default: false,
        },
        force: {
          alias: 'f',
          boolean: true,
          // default: false,
        },
        verbose: {
          describe: 'Increase verbosity',
          alias: 'v',
          count: true,
          // default: 0,
          // default: false,
        },
      },
      handler: argv => {
        if (!argv.path) {
          // Display help and abort if path is not provided
          cli.showHelp()
          return
        }
        $dev({ argv })
      },
    })
    .command(
      'scan [path]',
      'scan folder content',

      // @ts-expect-error TODO
      function (yargs) {
        return yargs
          .option('all', {
            alias: 'a',
            boolean: true,
            // default: false,
          })
          .option('index', {
            boolean: true,
          })
          .option('convert', {
            boolean: true,
          })
          .option('fix', {
            boolean: true,
          })
          .option('diff', {
            boolean: true,
          })
          .option('dry-run', {
            alias: 'n',
            boolean: true,
            // default: false,
          })
          .option('force', {
            alias: 'f',
            boolean: true,
            // default: false,
          })
          .option('verbose', {
            describe: 'Increase verbosity',
            alias: 'v',
            count: true,
            // default: 0,
            // default: false,
          })
      },
      async args => {
        let app //= new TfcApp()
        let dir = process.cwd()
        let path: string =
          args.path === '.' ? process.cwd() : (args.path as string)
        if (!args.path && !args.all) {
          cli.showHelp()
          console.log()
          console.error(
            'ERROR: Must specify either a path to scan or --all workspaces',
          )
          process.exitCode = 1
          return 1
        }

        if (path && !Path.isAbsolute(path)) {
          path = Path.resolve(path)
        }

        let p = {
          dir,
          path,
          all: args.all,
          force: args.force,
          verbosity: args.verbose,
          fix: args.fix,
          index: args.index,
          convert: args.convert,
          dryRun: args.dryRun,
          diff: args.diff,
        }
        await app.runScan(p)
      },
    )

  cli.demandCommand(1, 'Please specify a command').help().argv
}
