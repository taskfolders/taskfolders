import micromatch from 'micromatch'
import { LocalFileSystem } from '@taskfolders/utils/fs'
import { IssueItem } from '@taskfolders/utils/issues'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { join, isAbsolute } from 'path'
import { DC } from '@taskfolders/utils/dependencies'
import { ActiveFile } from './ActiveFile.js'
// import { TaskfoldersMarkdown } from '../../markdown/standard/TaskfoldersMarkdown'
// import { removeDeeperPaths } from './removeDeeperPaths'
// import { FolderLocationConfig } from '../../config/FolderLocationConfig'
import { dirname } from 'node:path'
import { $log, $dev } from '@taskfolders/utils/logger'
import { removeDeeperPaths } from './removeDeeperPaths.js'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
// import { upPathIndexes } from './upPathIndexes'
// import { IssueItem } from '@taskfolders/utils/issues/IssueItem'

const upPathIndexes = async (kv: { fs: LocalFileSystem; dir: string }) => {
  let acu: { path; md: TaskFoldersMarkdown }[] = []
  for (let path of findUpAll({ startFrom: kv.dir, findName: 'index.md' })) {
    let body = kv.fs.raw.readFileSync(path).toString()
    let { taskfolder: md } = await TaskFoldersMarkdown.parse(body)
    acu.push({ path, md })
  }
  return acu
}

// TODO warn about non existing exclude paths
// TODO ls, non recursive mid folder needs to read back excludes

/** TODO #performance on explorations
 * - reset exclude list on each dir exploration?
 */

/** Recursive list files with smart exclusions AND observing index.md file excludes
 *
 * TODO:similar core/filesystem/FileCollection #review
 * TODO needs better name ... DirectoryWalker .. FileWalker?
 * TODO drop DC.setup (when pssContainer default)
 *
 * - one media type search, needs to merge single File and MediaFolder
 * - evaluate config for each index.md (can exclude/include files)
 * - focus on getting first total list of files, and later process each one
 * - on each file
 *   - isolate file step errors
 *   - per file issues
 *
 * JOBS
 * - recursive explore considering exclude patterns in:
 *   - user global settings
 *   - index.md standard fm:.exclude
 *   - .gitignore  ?? #todo
 * - encourage use of ActiveFile
 */
// @DC.injectable('transient', { passContainer: false })
export class PathWalker<T> {
  fs = DC.inject(LocalFileSystem)
  dir: string
  exclude: string[]
  found: ActiveFile<T>[]

  constructor(kv: { dir?: string; fs?: LocalFileSystem } = {}) {
    // $dev({ kv })
    this.dir = kv.dir
    // TODO review  value initialization
    this.fs = kv.fs //?? new LocalFileSystem()
  }

  async _lsRecurse(kv: { path: string; acu?: ActiveFile[] }): Promise<any[]> {
    let { path, acu = [] } = kv
    let { fs } = this
    if (fs.raw.statSync(path).isFile()) {
      return [ActiveFile.create({ path: kv.path, fs: fs.raw })]
    }
    let dirFiles = this.fs.raw
      .readdirSync(path)
      .map(x => ActiveFile.create({ path: x, fs: fs.raw }))
    let exclude = []
    let indexFile = dirFiles.find(x => x.path === 'index.md')
    if (indexFile) {
      // TODO #review why this guard?
      try {
        let p1 = join(path, 'index.md')
        let body = this.fs.raw.readFileSync(p1).toString()
        let md2 = await TaskFoldersMarkdown.fromBodyMaybe(body)
        if (md2) {
          if (md2.data.exclude.includes('.')) {
            // TODO #review
            return acu
          }
          let fm = md2.data
          // let raw = md.frontMatter._props.toDataValues()
          // TODO re-eval this error guard
          try {
            // let props = tryTaskfoldersModel_OLD(raw)
            // exclude = props?.get('exclude') ?? []
            exclude = fm.exclude ?? []

            this.addExclusion({ exclude, path: kv.path })
          } catch (e) {
            indexFile.issues.push(
              IssueItem.create({
                code: 'tf/md-identify',
                severity: 'error',
                message: 'Could not try to guess if markdown is standard',
              }),
            )
          }
        }
      } catch (e) {
        $log.debug(e)
        indexFile.issues.push(
          IssueItem.create({
            code: 'tf/md-parse-1',
            message: 'Problem parsing markdown doc',
          }),
        )
      }
    }

    // let matches = micromatch(found, excludeAll)
    // found = found.filter(x => !matches.includes(x))
    // $dev({ matches, })

    for (let file of dirFiles) {
      let path_f = join(kv.path, file.path)
      file.path = path_f

      let pass = micromatch(path_f, this.exclude)
      if (pass.length) continue

      let isDir: Boolean
      try {
        isDir = file.stat.isDirectory()
      } catch (e) {
        let code
        let msg = `Could not access path`
        if (this.fs.raw.lstatSync(file.path)) {
          code = 'broken-link'
        } else if (this.fs.exists(file.path)) {
          code = 'no-access'
        } else {
          code = 'not-found'
        }
        file.issues.push({
          code,
          message: msg,
          severity: 'error',
        })

        // TODO #solve #review report error? log when verbose?
        // acu.push(file)
        $log.debug(`Could not stat file`, { file })
      }
      if (!isDir) {
        // $dev({ add: path_f, found })
        acu.push(file)
      } else {
        await this._lsRecurse({ path: path_f, acu })
      }
    }

    return acu
  }

  private addExclusion(kv: { exclude: string[]; path?: string }) {
    let n1 = kv.exclude.map(path => {
      if (kv.path) {
        // with base dir

        if (path.startsWith('./') || path.startsWith('**/')) {
          return join(kv.path, path)
        }

        return join(kv.path, '**', path)
      } else {
        // no base dir given
        if (path.startsWith('./')) {
          throw Error(`Cannot exclude relative path :${path}`)
        }
        if (isAbsolute(path)) {
          return path
        } else {
          return join('**', path)
        }
      }
    })

    this.exclude = this.exclude.concat(n1)
  }

  async lsRecurse(
    someDir: string | string[],
    kv: { glob?: string; exclude?: string[] } = {},
  ) {
    if (this.found) {
      throw Error('Avoid instance reuse for multiple searches')
    }

    let dirs = removeDeeperPaths([].concat(someDir))

    if (kv.exclude) {
      this.exclude = []
      this.addExclusion({ exclude: kv.exclude, path: null })
    } else {
      this.exclude = []
    }
    this.found = []
    // let exclude_default = [...this.exclude]

    // TODO use global settings exclude !
    // FolderLocationConfig

    let setUpPathExclude = async (dir: string) => {
      let all = await upPathIndexes({ fs: this.fs, dir })
      all.forEach(item => {
        let exclude = item.md?.data.exclude
        if (exclude) {
          this.addExclusion({ exclude, path: dirname(item.path) })
        }
      })
    }
    // $dev(this) // excluded paths?

    for (let dir of dirs) {
      if (!this.fs.exists(dir)) {
        let next = ActiveFile.create({ path: dir })
        next.issues.push({
          code: 'not-found',
          message: 'Path does not exist',
          severity: 'error',
        })
        this.found = this.found.concat(
          // @ts-expect-error TODO
          next,
        )
        continue
      }

      await setUpPathExclude(dir)

      let all = await this._lsRecurse({ path: dir })
      if (kv.glob) {
        const isMatch = micromatch.matcher([kv.glob])
        all = all.filter(x => isMatch(x.path))
      }
      this.found = this.found.concat(all)
    }

    return this.found
  }

  /** @deprecated */
  private async _globSlow(kv: { cwd; glob; exclude?: string[] }) {
    let exclude = kv.exclude ?? []
    let all = await this._lsRecurse({ path: kv.cwd })
    const isMatch = micromatch.matcher([kv.glob])
    // $dev({ all, g: kv.glob })
    all = all.filter(x => isMatch(x.path))
    // let ma = micromatch(all, [kv.glob])
    return all
  }

  /** @deprecated use .lsRecurse .glob */
  async globPaths(
    glo: string | string[],
    kv: { exclude?: string[] } = {},
  ): Promise<ActiveFile[]> {
    this.exclude = kv.exclude ?? []
    let res = this._globSlow({ glob: glo, cwd: this.dir, exclude: kv.exclude })
    return res
  }
}
