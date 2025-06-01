import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import fs from 'node:fs'
import { join } from 'path/posix'
import { decryptGPGMessage } from '../gpg/decryptGPGMessage.js'
import { cleanObject } from './cleanObject.js'
import { Folder } from './Folder.js'
import { Logger } from './Logger.js'
import { WorkspaceIndex } from './WorkspaceIndex.js'

export class ScanV2Handler {
  fs = fs
  log = new Logger()
  constructor(public params: { dir: string }) {}

  async execute() {
    let { dir } = this.params
    let { log } = this
    let start = new Date().getTime()

    let workspace: Folder
    let dir_now = dir
    while (dir_now !== '/') {
      let folder = new Folder(dir_now)
      await folder.parse()
      // console.log(dir_now, folder.isWorkspace(), folder.data)
      if (folder.isWorkspace()) {
        workspace = folder
        // TODO log.debug('found workspace', dir)
        break
      }
      dir_now = join(dir_now, '..')
    }

    if (!workspace) {
      throw new Error(`No workspace found in ${dir}`)
    }

    log.info('workspace', workspace?.dir)
    let wsIndexData = new WorkspaceIndex()
    let stats = { files: 0, errors: 0 }

    // Update all references to wsIndexData to use wsIndexData.data
    const scanFolder = async (folder: Folder) => {
      let files = folder.ls()
      let folders: Folder[] = []

      if (folder !== workspace) {
        if (folder.isWorkspace()) {
          log.info(
            'Avoid going down other workspace',
            workspace.relative(folder.dir),
          )
          return
        }
      }

      for (let file of files) {
        const scanFile = async (file: string) => {
          let fullPath = join(folder.dir, file)
          let relPath = workspace.relative(fullPath)

          // log.info('scan file', relPath)
          let scanMarkdown = async ({ body }) => {
            stats.files++
            let md = await MarkdownDocument.fromBody(body, {
              implicitFrontmatter: true,
            })
            let data = md.data as any
            if (data) {
              wsIndexData.updateFile(relPath, { uid: data.uid })
              wsIndexData.updateFile(relPath, { sid: data.sid })
            }
            let sec = await MarkdownSections.parse(md.content)
            for (let s of sec.all) {
              data = s.data

              if (data?.uid) {
                let dat = cleanObject({
                  uid: data.uid,
                  sid: data.sid,
                  lineText: s.heading,
                })
                wsIndexData.addFileSection(relPath, dat)
              }
            }
          }
          if (file.endsWith('.md')) {
            log.info('Scan file', relPath)

            let body = fs.readFileSync(fullPath, 'utf-8').toString()
            await scanMarkdown({ body })
          } else if (file.endsWith('index.json')) {
            log.info('Scan file', relPath)
            let body = fs.readFileSync(fullPath, 'utf-8').toString()
            let data = JSON.parse(body)
            if (data?.uid) {
              wsIndexData.updateFile(relPath, { uid: data.uid })
            }
          } else if (file.endsWith('.md.asc')) {
            log.info('Scan file', relPath)
            let body = fs.readFileSync(fullPath, 'utf-8').toString()
            let out = await decryptGPGMessage(body)

            scanMarkdown({ body: out.message })
            //console.log('TODO md.asc', relPath, out)
          } else {
            let stat = fs.statSync(fullPath)
            if (stat.isDirectory()) {
              let folder = new Folder(fullPath)
              await folder.parse()
              folders.push(folder)
            }
          }
        }

        await scanFile(file).catch(err => {
          stats.errors++
          log.info('Error scanning file', file)
          // TODO way to log error with print/error cause?
          // log.info('Error scanning file', file, {cause: error})
        })
      }

      for (let folder of folders) {
        let relPath = workspace.relative(folder.dir)
        //log.info('folder -', relPath)
        await scanFolder(folder).catch(err => {
          log.info('Error scanning folder', relPath)
        })
      }
    }

    await scanFolder(workspace)

    let wsIndexFile = workspace.dataDir({
      join: ['workspace-index.json'],
      ensure: true,
    })
    console.log()

    this.fs.writeFileSync(wsIndexFile, JSON.stringify(wsIndexData, null, 2))
    log.info('Workspace index written to', wsIndexFile)
    let diff = new Date().getTime() - start
    log.info(`Scan completed in ${diff}ms`)
    log.info(`Scanned ${stats.files} files`)

    let summary = {
      workspace: workspace?.dir,
    }

    return { index: wsIndexData }
  }
}
