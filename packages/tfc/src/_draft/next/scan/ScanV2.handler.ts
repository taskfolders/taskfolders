import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import fs from 'node:fs'
import { join } from 'path/posix'
import { decryptGPGMessage } from '../../gpg/decryptGPGMessage.js'
import { cleanObjectCopy } from '../cleanObject.js'
import { Folder } from '../Folder.js'
import { Logger } from '../Logger.js'
import { WorkspaceIndex, PathIndex } from '../index/WorkspaceIndex.js'
import { StandardMetadata } from '../StandardMetadata.js'
import { WorkspaceCollections } from './WorkspaceCollections.js'
import { toDate } from '../toDate.js'
import * as Path from 'node:path'
import { ByteSugar } from '@taskfolders/utils/fs'

export class ScanV2Handler {
  fs = fs
  log = new Logger()

  workspace: Folder
  stats = { files: 0, errors: 0 }
  wsIndexData: WorkspaceIndex

  constructor(public params: { dir: string; allWorkspaces?: boolean }) {}

  async _scanOneFile(file: string, folder: Folder, folders: Folder[]) {
    let { log, stats, workspace, wsIndexData } = this

    let fullPath = join(folder.dir, file)
    if (!fs.existsSync(fullPath)) {
      log.warn('File does not exist', fullPath)
      return
    }
    let relPath = workspace.relative(fullPath)

    if (file.endsWith('.md.asc')) {
      log.info('Skip', file)
      return
    }

    // log.info('scan file', relPath)
    let scanMarkdown = async ({ body, path }) => {
      stats.files++
      let md = await MarkdownDocument.fromBody(body, {
        implicitFrontmatter: true,
      })

      // TODO #now
      if (path.includes('now')) {
        wsIndexData.updateFile(relPath, {})
      } else if (path.includes('waiting')) {
        wsIndexData.updateFile(relPath, {})
      }

      // TODO #now use data_std and decide what/when index? or index all .md?
      if (md.data) {
        let _data = md.data as any
        let meta = new StandardMetadata(_data)
        // let item = wsIndexData.get(relPath)

        // ---
        // checks
        let issues = StandardMetadata.sanitize(_data)
        if (!issues.ok) {
          log.warn('Document frontmatter has issues', issues.issues)
        }

        // ---
        wsIndexData.updateFile(relPath, {
          uid: meta.uid,
          sid: meta.sid,
          review: meta.review,
          after: meta.after,
          before: meta.before,
          tags: meta.tags,
          flags: meta.flags,
        })

        if (meta.calendar.length > 0) {
          let calendar = meta.calendar.map(x => {
            log.warn('Calendar with no date')
            if (!x.date) return x

            let date = toDate(x.date)

            // log.info({ date: date.toISOString(), x: x.date })
            x.date = date
            return x
          })

          // TODO drop default?
          // TODO def-path-index
          let target = (wsIndexData.data.paths[relPath] ??= {
            sections: [],
          } as PathIndex)
          target.calendar = calendar
          // wsIndexData.data.paths[relPath] ??= {} calendar
        }
      }

      let sec = await MarkdownSections.parse(md.content)
      for (let s of sec.all) {
        if (!s.data) continue
        let data = new StandardMetadata(s.data)

        if (data?.uid) {
          let dat = cleanObjectCopy({
            uid: data.uid,
            sid: data.sid,
            lineText: s.heading,
          })
          wsIndexData.addFileSection(relPath, dat)
        }
      }
    }

    if (file.endsWith('.md')) {
      log.debug('Scan file', relPath)

      const stats = fs.statSync(fullPath)
      if (stats.size > 100_000) {
        let bytes = ByteSugar.fromBytes(stats.size)
        log.warn(
          `Skip large file (${bytes})`,
          Logger.link({ path: fullPath, text: relPath }),
        )
      } else {
        let body = fs.readFileSync(fullPath, 'utf-8').toString()
        await scanMarkdown({ body, path: relPath })
      }
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

      scanMarkdown({ body: out.message, path: '' })
      wsIndexData.updateFile(relPath, { uid: null })
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

  async _scanFolder(folder: Folder) {
    let { log, stats, workspace, wsIndexData } = this

    let files = folder.ls()
    if (folder.data_std) {
      if (folder.data_std.exclude.includes('.')) {
        log.info('excluding self dir', folder.dir)
        return
      }
      files = files.filter(name => {
        let exclude = folder.data_std.exclude.includes(name)
        if (exclude) {
          log.info('Excluding path', folder.dir, name)
        }
        return !exclude
      })
    }

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
      await this._scanOneFile(file, folder, folders).catch(err => {
        stats.errors++
        let link = Logger.link({
          text: file,
          path: Path.join(folder.dir, file),
        })
        log.error('Error scanning file', link)
        log.error(err)
        // TODO way to log error with print/error cause?
        // log.info('Error scanning file', file, {cause: error})
      })
    }

    for (let folder of folders) {
      let relPath = workspace.relative(folder.dir)
      //log.info('folder -', relPath)
      await this._scanFolder(folder).catch(err => {
        log.info('Error scanning folder', relPath)
      })
    }
  }

  async execute() {
    let { dir } = this.params
    let { log, stats } = this
    let start = new Date().getTime()

    log.put()
    log.print(th => ['TODO scan2', th.link({ path: __filename })])
    log.put()

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
    let wsIndexData = new WorkspaceIndex({ path: null })
    wsIndexData.pathIndexFile = workspace.dataDir({
      join: ['workspace-index.json'],
      ensure: true,
    })
    wsIndexData.pathBaseDir = workspace.dir

    // let before = new WorkspaceIndex({ path: wsIndexData.pathIndexFile })
    // if (fs.existsSync(before.pathIndexFile)) {
    //   let doc = fs.readFileSync(before.pathIndexFile).toString()
    //   before.loadJSON(doc)
    // }

    log.info('Using index file', wsIndexData.pathIndexFile)
    log.put()

    // TODO clean
    this.workspace = workspace
    this.wsIndexData = wsIndexData
    return await this._runWorkspaceScan({
      workspace,
      start,
      log,
      wsIndexData,
      stats,
    })
  }

  async _runWorkspaceScan(kv: {
    workspace: Folder
    wsIndexData: WorkspaceIndex
    log: Logger
    stats
    start: number
  }) {
    let { workspace, wsIndexData, log, stats, start } = kv

    await this._scanFolder(workspace)

    this.fs.writeFileSync(
      wsIndexData.pathIndexFile,
      JSON.stringify(wsIndexData, null, 2),
    )
    log.info('Workspace index written to', wsIndexData.pathIndexFile)
    let diff = new Date().getTime() - start
    log.info(`Scan completed in ${diff}ms`)
    log.info(`Scanned files=${stats.files} errors=${stats.errors}`)

    let summary = {
      workspace: workspace?.dir,
    }

    let dat = workspace.data_std
    if (dat.flags.includes('workspace-global')) {
      let t1 = new WorkspaceCollections()
      t1.upsert({ uid: dat.uid, sid: dat.sid, dir: workspace.dir })

      await t1.write()
      log.info('Wrote ws location', { dir: workspace.dir, conf: t1.file })
    }

    return { index: wsIndexData }
  }
}
