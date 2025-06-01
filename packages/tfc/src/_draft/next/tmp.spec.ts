import { findWorkspaceUp } from '../WorkspaceRepo.js'
import {
  MarkdownDocument,
  MarkdownSections,
  TaskFoldersMarkdown,
} from '@taskfolders/utils/markdown'
import Path, { join, relative } from 'node:path'
import { decryptGPGMessage } from '../gpg/decryptGPGMessage.js'
import { Logger } from './Logger.js'
import fs from 'node:fs'

class WorkspaceIndex {
  _index = { uids: {} }
  path: string
  data = {
    type: 'draft/workspace-index/1',
    version: 1,
    paths: {},
  } as {
    type: string
    version: number
    paths: Record<
      string,
      {
        sid?: any
        uid?: any
        sections: { uid?; sid?; lineText? }[]
      }
    >
  }

  find(kv: { uid: string }): { path; type } {
    this._refreshIndex()
    return this._index.uids[kv.uid]
  }

  _refreshIndex() {
    for (let [key, val] of Object.entries(this.data.paths)) {
      if (val.uid) {
        this._index.uids[val.uid] = { path: key, type: 'path' }
      }
    }
  }

  addFileSection(
    relPath: string,
    kv: { uid?: any; sid?: any; lineText?: string },
  ) {
    this.data.paths[relPath] ??= { sections: [] }
    let target = this.data.paths[relPath]
    target.sections.push(kv)
  }

  updateFile(relPath: string, kv: { uid?: any; sid?: any }) {
    this.data.paths[relPath] ??= { sections: [] }
    let target = this.data.paths[relPath]
    if (kv.uid) {
      target.uid = kv.uid
    }
    if (kv.sid) {
      target.sid = kv.sid
    }
  }
}

class Folder {
  fs = fs
  data

  constructor(public dir: string) {}

  findBase() {
    //let all = findUpAll({ startFrom: this.dir, findName: 'index.md' })
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

export class ScanV2Handler {
  fs = fs
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
    let wsIndexData = new WorkspaceIndex()

    // Update all references to wsIndexData to use wsIndexData.data

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
          let body = fs.readFileSync(fullPath, 'utf-8').toString()
          await scanMarkdown({ body })
        } else if (file.endsWith('.json')) {
          let body = fs.readFileSync(fullPath, 'utf-8').toString()
          let data = JSON.parse(body)
          if (data?.uid) {
            wsIndexData.updateFile(relPath, { uid: data.uid })
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

    let wsIndexFile = workspace.dataDir({
      join: ['workspace-index.json'],
      ensure: true,
    })
    log.info({ wsIndexData })
    this.fs.writeFileSync(wsIndexFile, JSON.stringify(wsIndexData, null, 2))
    log.info('Workspace index written to', wsIndexFile)

    let summary = {
      workspace: workspace?.dir,
    }

    return { index: wsIndexData }
  }
}

import { expect, describe, it } from 'vitest'
import { cleanObject } from './cleanObject.js'

it.only('x y', async () => {
  let dir = join(process.env.HOME, 'repos/tf-open/packages/tfc/samples/one')
  dir = join(process.env.HOME, 'repos/play/demo/one')

  let s1 = new ScanV2Handler({ dir })
  let result = await s1.execute()

  expect(
    result.index.find({
      uid: 'aaf32c4f-a39a-420f-bff9-ba217f5825b9',
    }),
  ).toEqual({ path: 'panda/foo.md', type: 'path' })
  //sut.parse()
  //sut.findBase()
})
