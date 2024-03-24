import { LocalFileSystem } from '@taskfolders/utils/fs'
import envPaths from 'env-paths'
import * as Path from 'node:path'
import { join } from 'node:path'
import { DiskIndexRepository } from './disk-index/DiskIndexRepository.js'
import { PathWalker } from '../../_draft/walker/PathWalker.js'
import { $log, Logger } from '@taskfolders/utils/logger'
import {
  MarkdownDocument,
  TaskFoldersMarkdown,
} from '@taskfolders/utils/markdown'
import { DC } from '@taskfolders/utils/dependencies'
import { AppDirs } from '../../_draft/AppDirs.js'
import { ActiveFile } from '../../_draft/walker/ActiveFile.js'
import { inspect } from 'node:util'
import { shellHyperlink } from '@taskfolders/utils/screen'
import { MarkdownScanner } from './scan-engines/MarkdownScanner.js'
import {
  ScannerEngineResult,
  BaseFileScanner,
} from './scan-engines/BaseFileScanner.js'
import { ScriptScanner } from './scan-engines/ScriptScanner.js'
import { YamlScanner } from './scan-engines/YamlScanner.js'
import { EncryptedMarkdownScanner } from './scan-engines/EncryptedMarkdownScanner.js'
import { SourceCodeScanner } from './scan-engines/SourceCodeScanner.js'

export class ScanPathContent {
  log = DC.inject(Logger)
  fs = DC.inject(LocalFileSystem)
  params: {
    path: string
    cwd?: string
    convert?: boolean
    dryRun?: boolean
  }
  disk: DiskIndexRepository
  appDirs = DC.inject(AppDirs)
  cwd: string

  static async create(kv: { dc: DC; params: ScanPathContent['params'] }) {
    let obj = new this()
    obj.params = kv.params
    // obj.appDirs = kv.dc.fetch(AppDirs)
    kv.dc.finish(obj)

    let disk = kv.dc.fetch(DiskIndexRepository)
    obj.disk = disk
    // TODO #now without load?
    disk.dbFile = obj.appDirs.configPath('db.json')
    await disk.load()
    obj.appDirs.ensure()

    return obj
  }

  async onFileScan(kv: {
    file: ActiveFile
    fileCounter
    fileTotal: number
    engineResults: ScannerEngineResult[]
  }) {
    let { log } = this
    let { file } = kv
    let cwd = this.cwd

    // print line
    let path_r = Path.relative(cwd, file.path)
    path_r = shellHyperlink({ text: path_r, path: file.path })

    let fileType = kv.engineResults[0].engine

    let li = log
      .put(st => [
        path_r,
        `${kv.fileCounter}/${kv.fileTotal}`,
        st.dim(fileType),
        file.modified ? st.color.green('+modified') : null,
      ])
      .indent()
    let st = log.screen.style

    // print issue
    for (let issue of file.issues) {
      let code = st.color.cyan(issue.code)

      let severity = issue.severity.toUpperCase().padEnd(5)
      if (issue.severity === 'error') {
        severity = st.error(severity)
      } else if (issue.severity === 'warning') {
        severity = st.warning(severity)
      } else if (issue.severity === 'info') {
        severity = st.color.blue(severity)
      }

      let lii = li.put([severity, code, issue.message]).indent()
      if (issue.data) {
        let txt = inspect(issue.data)
        lii.put(txt)
      }
    }

    // modified
    if (this.params.dryRun !== true) {
      this.fs.write(file)
    }
  }

  async execute() {
    let { fs, params: p, log, disk } = this
    let cwd = p.cwd ?? p.path
    this.cwd = cwd

    log.info('Start scan')

    let settings = this.appDirs.configData()
    let walker = new PathWalker<{ tfm: TaskFoldersMarkdown }>()
    let { exclude } = settings

    walker.fs = fs
    let allFiles = await walker.lsRecurse(p.path, { exclude })
    //$dev(allFiles[0].issues)

    log.put(`Found ${allFiles.length} files to scan`)

    let ctx = {
      disk,
      options: { convert: p.convert },
      log,
    }

    let engines: BaseFileScanner[] = [
      new MarkdownScanner(ctx),
      new ScriptScanner(ctx),
      new YamlScanner(ctx),
      new SourceCodeScanner(ctx),
    ]
    if (process.env.TASKFOLDERS_FF_GPG) {
      engines.push(new EncryptedMarkdownScanner(ctx))
    }

    //allFiles = allFiles.slice(0, 1)
    for (let [idx, file] of allFiles.entries()) {
      let acu: ScannerEngineResult[] = []
      for (let eng of engines) {
        let res = await eng.execute({ file }).catch(e => {
          $log.debug('Engine crash', file.path)
          file.issues.push({ severity: 'error', code: 'engine-crash' })
          let res: ScannerEngineResult = { engine: eng.code }
          return res
        })
        acu.push(res as ScannerEngineResult)
      }
      acu = acu.filter(Boolean)

      if (acu.length > 0) {
        await this.onFileScan({
          file,
          fileCounter: idx + 1,
          fileTotal: allFiles.length,
          engineResults: acu,
        })
      }
    }

    if (p.dryRun !== true) {
      await disk.save()
    } else {
      log.warn('Skip index update because of dry-run')
    }
  }
}
