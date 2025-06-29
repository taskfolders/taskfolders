import Yargs from 'yargs'
import { DC } from '@taskfolders/utils/dependencies'
import { ScanV2Handler } from './_draft/next/scan/ScanV2.handler.js'
import { ReadReferenceHandler } from './_draft/next/ReadReference.handler.js'
import { SummaryHandler } from './_draft/next/summary/Summary.handler.js'

export class TfcApp {
  dc = new DC()

  executeCli(arg?: string | string[]) {
    let { dc } = this
    let cli = Yargs(arg ?? process.argv.slice(2)) //
      .scriptName('tfc')
      .strict(true)

      .command({
        command: 'scan-old-1 [path]',
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

          let path = argv.path ?? process.cwd()

          let handler = await ScanPathContent.create({
            dc,
            params: {
              path,
              dryRun: argv.dryRun,
              convert: argv.convert,
            },
          })
          await handler.execute()
        },
      })

      .command({
        command: 'kv id [query]',
        describe: 'Get key value for file',
        handler: async argv => {
          let { GetKeyValue } = await import(
            './handlers/GetKeyValue/GetKeyValue.js'
          )
          let sut = dc.fetch(GetKeyValue)
          sut.params = { id: argv.id, query: argv.query }
          let res = await sut.execute()
          console.log(res)
        },
      })

      .command({
        command: 'show-old-1 id',
        describe: 'Show file by sid/uid',
        handler: async argv => {
          let { GetKeyValue } = await import(
            './handlers/GetKeyValue/GetKeyValue.js'
          )
          let sut = dc.fetch(GetKeyValue)
          // sut.params = { id: argv.id, query: argv.query }
          // let res = await sut.execute()
        },
      })

      .command({
        command: 'show id',
        describe: 'NEW Show file by sid/uid',
        handler: async argv => {
          let han = new ReadReferenceHandler({
            cwd: process.cwd(),
            id: argv.id,
          })
          await han.execute()
        },
      })

      .command({
        command: 'workspaces',
        describe: 'List workspaces',
        handler: async argv => {
          let { ListWorkspaces } = await import('./handlers/ListWorkspaces.js')
          let sut = dc.fetch(ListWorkspaces)
          await sut.execute()
        },
      })

      .command({
        command: 'info',
        describe: 'Generic info about tfc',
        handler: async argv => {
          let { GetAppInfo } = await import('./handlers/GetAppInfo.js')
          let handler = dc.fetch(GetAppInfo)
          let data = await handler.execute()
          console.log(data)
        },
      })

      .command({
        command: 'scan',
        describe: 'NEW next generation scan',
        handler: async argv => {
          let han = new ScanV2Handler({ dir: process.cwd() })
          await han.execute()
        },
      })

      .command({
        command: 'sum',
        describe: 'NEW summary of workspace',
        builder: {
          all: {
            boolean: false,
          },
        },
        handler: async argv => {
          let han = new SummaryHandler({
            cwd: process.cwd(),
            allWorkspaces: argv.all,
          })
          await han.setup()
          await han.execute()
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
