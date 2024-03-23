import Yargs from 'yargs'
import { DC } from '@taskfolders/utils/dependencies'
import { ListWorkspaces } from './handlers/ListWorkspaces.js'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { join } from 'node:path'
import { readFileSync } from 'fs'
const __dirname = dirname(fileURLToPath(import.meta.url))

export class TfcApp {
  dc = new DC()

  executeCli(arg?: string | string[]) {
    let { dc } = this
    let cli = Yargs(arg ?? process.argv.slice(2)) //
      .scriptName('tfc')
      .strict(true)

      .command({
        command: 'scan [path]',
        describe: 'scan folder content',
        builder: {
          convert: {
            describe: 'Convert untyped markdowns to TaskFolders type',
            type: 'boolean',
          },
          'dry-run': {
            alias: 'n',
            boolean: true,
            default: false,
          },
          all: {
            boolean: true,
          },
        },
        handler: async argv => {
          const { ScanPathContent } = await import(
            './handlers/ScanPathContent/ScanPathContent.js'
          )
          let handler = await ScanPathContent.create({
            dc,
            params: {
              path: process.cwd(),
              dryRun: argv.dryRun,
              convert: argv.convert,
            },
          })
          await handler.execute()
        },
      })
      .command({
        command: 'workspaces',
        describe: 'List workspaces',
        handler: async argv => {
          let sut = dc.fetch(ListWorkspaces)
          await sut.execute()
        },
      })

      .command({
        command: 'version',
        describe: 'app version',
        handler: async argv => {
          let p1 = join(__dirname, '../package.json')
          let doc = JSON.parse(readFileSync(p1).toString())
          let ver = doc.version
          console.log(ver)
        },
      })

      .command(
        '$0',
        false, // describe:false to hide in help
        () => {},
        async argv => {
          let txt = await cli.getHelp()
          console.log(txt)
        },
      )

    //cli.help().argv
    let res = cli.parse()
  }
}
