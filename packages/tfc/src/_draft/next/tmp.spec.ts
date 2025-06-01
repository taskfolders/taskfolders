import { join } from 'path'
import * as Path from 'path'
import { expect, describe, it } from 'vitest'
import fs from 'node:fs'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
import { findWorkspaceUp } from '../WorkspaceRepo.js'
import {
  MarkdownDocument,
  MarkdownSections,
  TaskFoldersMarkdown,
} from '@taskfolders/utils/markdown'
import { relative } from 'node:path'
import { inspect } from 'node:util'
import { decryptGPGMessage } from '../gpg/decryptGPGMessage.js'

class Folder {
  fs = fs
  data

  constructor(public dir: string) {}

  findBase() {
    let all = findUpAll({ startFrom: this.dir, findName: 'index.md' })
  }

  async parse() {
    let dir = this.dir

    let files = fs.readdirSync(dir)

    if (files.includes('index.json')) {
      let file = join(dir, 'index.json')
      let json = fs.readFileSync(file, 'utf-8').toString()
      let doc = JSON.parse(json)
      this.data = doc
    } else if (files.includes('index.md')) {
      let file = join(dir, 'index.md')
      let body = fs.readFileSync(file, 'utf-8').toString()
      let md = await MarkdownDocument.fromBody(body)

      this.data = md.data
    } else if (files.includes('index.md.asc')) {
      console.log('TODO gpg asc')
    } else if (files.includes('index.md.gpg')) {
      console.log('TODO gpg asc')
    }
  }

  dataDir(kv: { ensure?; join?: string[] } = {}) {
    let path = join(this.dir, '_data')
    if (kv.ensure) {
      this.fs.mkdirSync(path, { recursive: true })
    }
    if (kv.join) {
      path = join(path, ...kv.join)
    }
    return path
  }

  isWorkspace() {
    return this.data?.labels === 'workspace'
  }
  relative(path) {
    return Path.relative(this.dir, path)
  }

  ls(): string[] {
    let files = this.fs.readdirSync(this.dir)
    files = files.filter(
      file => !['node_modules', '.git', '_data'].includes(file),
    )
    return files
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} ${this.dir}>`
  }
}

class Logger {
  options = {
    deep: false,
  }

  info(...args) {
    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        args = [inspect(args[0], { depth: null, colors: true })]
      }
    }
    console.log('[INFO]', ...args)
  }
  deep() {
    let next = new Logger()
    return next
  }
  child() {
    // return one shot parametrize logger
    return this
  }
}

export class ScanV2Handler {
  constructor(public params: { dir: string }) {}

  async execute() {
    let { dir } = this.params
    let log = new Logger()

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
    let wsIndexData = {
      type: 'draft/workspace-index/1',
      version: 1,
      uids: {},
      paths: {},
    }

    const scanFolder = async (folder: Folder) => {
      let files = folder.ls()
      let folders: Folder[] = []
      for (let file of files) {
        let fullPath = join(folder.dir, file)
        let relPath = workspace.relative(fullPath)
        // log.info('scan file', relPath)
        let scanMarkdown = async ({ body }) => {
          let md = await MarkdownDocument.fromBody(body, {
            implicitFrontmatter: true,
          })
          let data = md.data as any
          if (data) {
            if (data.uid) {
              wsIndexData.uids[data.uid] = { path: relPath }
              wsIndexData.paths[relPath] = { uids: [data.uid] }
            }
            if (data.sid) {
              wsIndexData.paths[relPath] = { sids: [data.sid] }
            }
          }
          let sec = await MarkdownSections.parse(md.content)
          for (let s of sec.all) {
            data = s.data

            if (data?.uid) {
              wsIndexData.uids[data.uid] = {
                path: relPath,
                section: true,
                line: s.heading,
              }
              wsIndexData.paths[relPath] ??= {}
              wsIndexData.paths[relPath].uids ??= []
              wsIndexData.paths[relPath].uids.push(data.uid)
            }
          }
        }
        if (file.endsWith('.md')) {
          let body = fs.readFileSync(fullPath, 'utf-8').toString()
          await scanMarkdown({ body })
        } else if (file.endsWith('.json')) {
          let body = fs.readFileSync(fullPath, 'utf-8').toString()
          let data = JSON.parse(body)
          if (data?.uid) {
            wsIndexData.uids[data.uid] = { path: relPath }
          }
        } else if (file.endsWith('.md.asc')) {
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

      for (let folder of folders) {
        let relPath = workspace.relative(folder.dir)
        //log.info('folder -', relPath)
        await scanFolder(folder)
      }
    }
    await scanFolder(workspace)

    let wsIndexFile = workspace.dataDir()
    log.info({ wsIndexData })

    let summary = {
      workspace: workspace?.dir,
    }
  }
}

it.only('x y', async () => {
  let dir = join(process.env.HOME, 'repos/tf-open/packages/tfc/samples/one')
  dir = join(process.env.HOME, 'repos/play/demo/one')

  let s1 = new ScanV2Handler({ dir })
  await s1.execute()

  //sut.parse()
  //sut.findBase()
})
