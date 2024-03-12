import * as nodeFS from 'node:fs'
import * as Path from 'node:path'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
import type { PackageJsonType } from '@taskfolders/utils/vendors/npm'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { join } from 'node:path'
import { SourcePosition } from '@taskfolders/utils/runtime/position'
import { DC } from '@taskfolders/utils/dependencies'
import { ScriptStatus } from '../scripts/ScriptStatus.js'

type ScriptItemBase = {
  key: string
  dir: string
  title: string
  value?: any
  position?: SourcePosition
  data?: any
} //| { type: 'markdown-script' }

type TaskNpm = ScriptItemBase & { type: 'npm' }
type TaskBin = ScriptItemBase & { type: 'bin' }
//type TaskMarkdown = ScriptItemBase & { type: 'markdown-script' }
type TaskScriptFolder = ScriptItemBase & {
  type: 'task-script'
  scriptPath: string
}
type TaskMarkdown = ScriptItemBase & { type: 'md-script' }
export type ScriptItem = TaskNpm | TaskMarkdown | TaskBin | TaskScriptFolder

// export type ScriptItem = {
//   key: string
//   type: 'npm' | 'md-script' | 'bin' | 'task-script'
//   dir: string
//   title: string
//   value?: any
//   scriptFile?: string
//   position?: SourcePosition
//   data?: any
// } //| { type: 'markdown-script' }

export class TaskFinder {
  fs = nodeFS
  cwd = process.cwd()
  dc: DC

  constructor(kv: { fs: typeof nodeFS; cwd: string; dc: DC }) {
    this.fs = kv.fs
    this.cwd = kv.cwd
    this.dc = kv.dc
  }

  async _findMarkdownScripts(): Promise<ScriptItem[]> {
    let { cwd, fs } = this
    let all = findUpAll({
      startFrom: cwd,
      findName: 'index.md',
    })

    let acu: ScriptItem[] = []
    let scripts
    for (let path of all) {
      let txt = fs.readFileSync(path).toString()

      let { taskfolder: md } = await TaskFoldersMarkdown.parse(txt)
      if (!md) continue
      scripts = md.data.scripts
      Object.entries(scripts ?? {}).map(([key, value]) => {
        let title = value.title ?? '> ' + value.run

        let position = new SourcePosition({ path, lineNumber: 1 })
        acu.push({
          type: 'md-script',
          dir: Path.dirname(path),
          key,
          title,
          value,
          position,
        })
      })
    }
    return acu
  }

  async _findTaskScripts(): Promise<ScriptItem[]> {
    let { fs, cwd } = this

    let acu: ScriptItem[] = []
    findUpAll({
      startFrom: cwd,
      test(aPath) {
        let pathTasks = Path.join(aPath, 'tasks')
        if (fs.existsSync(pathTasks)) {
          let entries = fs.readdirSync(pathTasks, { withFileTypes: true })
          for (let en of entries) {
            if (en.isDirectory()) {
              let dir = join(pathTasks, en.name)

              let path = join(dir, 'index.script.ts')
              if (fs.existsSync(path)) {
                let position = new SourcePosition({ path })

                // TODO #bug should import file and check .dirData
                let statusFile = join(dir, '_data/index.json')
                let status = ScriptStatus.tryRead({ path: statusFile, fs })
                let data
                if (status) {
                  data = { ok: true, timestamp: status.timestamp }
                }

                acu.push({
                  key: en.name,
                  title: `> tk tasks/${en.name}`,
                  type: 'task-script',
                  value: path,
                  scriptPath: path,
                  dir: aPath,
                  position,
                  data,
                })
                continue
              }

              let tryFile = (fileName: string) => {
                path = join(dir, fileName)
                if (fs.existsSync(path)) {
                  let position = new SourcePosition({ path })
                  acu.push({
                    key: en.name,
                    title: `> tk tasks/${en.name}`,
                    type: 'task-script',
                    value: path,
                    scriptPath: path,
                    dir: aPath,
                    position,
                  })
                  return true
                }
              }

              if (tryFile('index.start.ts')) continue
              if (tryFile('index.sh')) continue
              if (tryFile('index.bash')) continue
              if (tryFile('index.py')) continue
            }
          }
        }
        return null as any
      },
    }).filter(
      x => x !== '/bin' && x !== Path.join(process.env.HOME ?? '/', 'bin'),
    )
    return acu
  }

  async _findBin(): Promise<ScriptItem[]> {
    let { fs, cwd } = this
    let all = findUpAll({
      startFrom: cwd,
      findName: 'bin',
    }).filter(
      x => x !== '/bin' && x !== Path.join(process.env.HOME ?? '/', 'bin'),
    )

    let acu: ScriptItem[] = []
    for (let path of all) {
      let bins = fs.readdirSync(path)
      let dir = Path.dirname(path)
      bins.forEach(key => {
        let value = `./bin/${key}`
        let binPath = join(path, key)
        let position = new SourcePosition({ path: binPath, lineNumber: 1 })
        let res: ScriptItem = {
          type: 'bin',
          dir,
          key,
          title: '> ' + value,
          value,
          position,
        }
        acu.push(res)
      })

      // { type: 'bin'; path: string; run: string }
    }
    return acu
  }

  async _findNpm(): Promise<ScriptItem[]> {
    let { fs, cwd } = this
    let all = findUpAll({
      startFrom: cwd,
      findName: 'package.json',
    })
      .map(path => {
        let data = JSON.parse(
          fs.readFileSync(path).toString(),
        ) as PackageJsonType
        let dir = Path.dirname(path)
        let position = new SourcePosition({ path, lineNumber: 1 })
        return Object.entries(data.scripts ?? {}).map(([key, value]) => {
          let item: ScriptItem = {
            type: 'npm',
            key,
            dir,
            title: '> ' + value,
            position,
          }
          return item
        })
      })
      .flat()
      .filter(
        x =>
          // Drops default npm "test" script placeholder
          !x.title.endsWith('&& exit 1'),
      )
    return all
  }

  async findAll(): Promise<ScriptItem[]> {
    let npm = await this._findNpm()
    let mds = await this._findMarkdownScripts()
    let bins = await this._findBin()
    let tasks = await this._findTaskScripts()
    let all = [npm, mds, bins, tasks].flat().sort((lhs, rhs) => {
      let diff = rhs.dir.length - lhs.dir.length
      if (diff !== 0) return diff
      return lhs.key.localeCompare(rhs.key)
    })

    return all
  }
}
