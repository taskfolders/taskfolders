import Yargs from 'yargs'
import { DC } from '@taskfolders/utils/dependencies'
import * as fs from 'node:fs'

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
            alias: 'a',
            default: false,
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
          const { ReadReferenceHandler } = await import(
            './features/read/_drop/ReadReference.handler.js'
          )
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
        command: 'scan [path]',
        describe: 'NEW next generation scan',
        builder: {
          all: {
            boolean: true,
            alias: 'a',
            default: false,
          },
        },
        handler: async argv => {
          const { ScanV2Handler } = await import(
            './_draft/next/scan/ScanV2.handler.js'
          )
          let han = new ScanV2Handler({
            dir: process.cwd(),
            allWorkspaces: argv.all,
          })
          await han.execute()
        },
      })

      .command({
        command: 'sum',
        describe: 'NEW summary of workspace',
        builder: {
          showAll: {
            boolean: true,
            default: false,
          },
          all: {
            boolean: true,
            alias: 'a',
            default: false,
          },
        },
        handler: async argv => {
          const { SummaryHandler } = await import(
            './_draft/next/summary/Summary.handler.js'
          )
          let han = new SummaryHandler({
            cwd: process.cwd(),
            allWorkspaces: argv.all,
            showAll: argv.showAll,
          })
          await han.execute()
        },
      })

      .command({
        command: 'fold path',
        describe: 'NEW ',
        handler: async argv => {
          let pathFrom = argv.path
          if (!fs.existsSync(pathFrom)) {
            throw Error('Path does not exist')
          }
          let pathToDir = argv.path.replace('.md', '')
          if (fs.existsSync(pathToDir)) {
            // throw Error('Target dir already exists')
          }
          let pathTo = pathToDir + '/index.md'
          if (fs.existsSync(pathTo)) {
            throw Error('Target already exists')
          }
          console.log({ pathToDir, pathTo, pathFrom })
          fs.mkdirSync(pathToDir)
          await fs.promises.rename(pathFrom, pathTo)
        },
      })

      .command({
        command: 'log <message...>',
        describe: 'DRAFT convert string to folder path',
        handler: async argv => {
          const { AddLogEventHandler } = await import(
            './handlers/AddLogEvent/AddLogEventHandler.js'
          )

          let handler = new AddLogEventHandler({
            cwd: process.cwd(),
            message: argv.message.join(' '),
          })
          await handler.execute()
        },
      })
      // .command({
      //   command: 'log:ls',
      //   describe: 'DRAFT convert string to folder path',
      //   handler: async argv => {
      //     const { AddLogEventHandler } = await import(
      //       './handlers/AddLogEvent/AddLogEventHandler.js'
      //     )

      //     let handler = new AddLogEventHandler({
      //       cwd: process.cwd(),
      //     })
      //     // await handler.execute()
      //   },
      // })
      .command({
        command: 'dir path-id',
        describe: 'DRAFT convert string to folder path',
        handler: async argv => {},
      })

      .command({
        command: 'inbox [pick]',
        describe: 'DRAFT move in from inbox',
        handler: async argv => {
          const { PullInboxHandler } = await import(
            './handlers/PullInbox/PullInboxHandler.js'
          )
          let handler = new PullInboxHandler()
          await handler.execute()
        },
      })

      .command({
        command: 'status',
        describe: 'DRAFT status',
        handler: async argv => {
          const { ShowFolderStatusHandler } = await import(
            './features/status/ShowFolderStatusHandler.js'
          )

          await new ShowFolderStatusHandler({
            cwd: process.cwd(),
            // reference: argv.reference,
          }).execute()
        },
      })

      .command({
        command: 'read reference',
        describe: 'DRAFT read markdown data',
        builder: {
          json: {
            describe: 'Print as json',
            alias: 'j',
            type: 'string',
          },
        },

        handler: async argv => {
          const { ReadMarkdownHandler } = await import(
            './features/read/ReadMarkdownHandler.js'
          )

          let stream
          if (!process.stdin.isTTY) {
            // Data is being piped in
            stream = await new Promise(resolve => {
              let data = ''
              process.stdin.on('data', chunk => (data += chunk))
              process.stdin.on('end', () => {
                console.log('Received piped data:', data)
                stream = data
              })
            })
          } else {
            // console.log('No piped data, running in interactive mode')
          }

          let reference
          if (!stream) {
            reference = argv.reference
          }

          await new ReadMarkdownHandler({
            cwd: process.cwd(),
            reference: reference,
            options: {
              json: argv.json !== undefined,
            },
            // reference: argv.reference,
          }).execute()
        },
      })

      .command({
        command: 'edit reference',
        describe: 'DRAFT edit',
        handler: async argv => {
          const { EditReferenceHandler } = await import(
            './handlers/EditReference/EditReference.handler.js'
          )

          await new EditReferenceHandler({
            reference: argv.reference,
          }).execute()
        },
      })

      .command({
        command: 'time',
        describe: 'DRAFT edit',
        handler: async argv => {
          const { RunTimerHandler } = await import(
            './features/time-tracking/RunTimerHandler.js'
          )

          await new RunTimerHandler({
            // reference: argv.reference,
          }).execute()
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
