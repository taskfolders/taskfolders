import { createSort } from '@taskfolders/utils/native/array/createSort'
import fs from 'node:fs'
import Path, { join } from 'path/posix'
import { NodeLogger } from '../../_draft/logger/NodeLogger.js'

type LatestDirs = {
  dir
  latest: {
    path
    mtime: Date
  }[]
}
import inquirer from 'inquirer'

export class PullInboxHandler {
  log = new NodeLogger()
  fs = fs

  constructor(
    public params: {
      cwd?
      createInboxDir?: boolean
      ansiPrint?: boolean
    } = { cwd: process.cwd() },
  ) {}

  dirs = [
    join(process.env.HOME, 'Downloads'),
    join(process.env.HOME, 'Pictures/Bildschirmfotos'),
    //join(process.env.HOME, 'Downloads/Screenshots'),
  ]

  async _select(acu: LatestDirs[]) {
    let choices = []
    for (const item of acu) {
      choices.push(new inquirer.Separator(`\nLatest files in ${item.dir}`))
      for (const f of item.latest) {
        let basename = Path.basename(f.path)
        basename = NodeLogger.link({
          text: basename,
          path: f.path,
        })

        let url = 'file:///tmp'
        choices.push({ name: basename, value: `${f.path}`, url })
      }
    }

    const run = async () => {
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedFiles',
          message: 'Select files:',
          choices,
          pageSize: 20,
        },
      ])

      console.log('\nSelected files:')
      console.log(answers.selectedFiles)
      return answers.selectedFiles
    }
    return await run()
  }

  async execute() {
    let { log, dirs } = this
    let fs = this.fs
    log.info({ dirs })

    let findLatestFiles = (dir, kv: { max?; fs: typeof fs }) => {
      let all = fs.readdirSync(dir).map(pathRelative => {
        let pathFull = join(dir, pathRelative)
        let stat = fs.statSync(pathFull)

        return { path: pathFull, mtime: stat.mtime }
      })
      all.sort(createSort({ key: 'mtime', direction: 'descending' }))
      all = all.filter(x => {
        if (x.path.startsWith('.')) return false
        return true
      })
      all = all.slice(0, kv.max ?? 5)
      return all
    }

    let acu: LatestDirs[] = []
    for (let dir of dirs) {
      let latest = findLatestFiles(dir, { fs })
      acu.push({ dir, latest })
      for (let file of latest) {
        let path = file.path
        if (path.length > 50) {
          path = file.path.slice(0, 40)
          path += '...' + file.path.slice(-8)
        }
        // path = NodeLogger.link({ text: path, path: join(dir, file.path) })
        // log.put(`${path}`)
      }
    }

    if (this.params.ansiPrint) {
      for (let item of acu) {
        log.put(`Latest files in ${item.dir}`)
        for (let file of item.latest) {
          let path = file.path
          if (path.length > 50) {
            path = file.path.slice(0, 40)
            path += '...' + file.path.slice(-8)
          }
          // path = NodeLogger.link({ text: path, path: join(dir, file.path) })
          // log.put(`${path}`)
        }
      }
      return
    }

    let selected = await this._select(acu)

    let inboxDir = join(this.params.cwd, '_inbox')
    if (!fs.existsSync(inboxDir)) {
      if (this.params.createInboxDir) {
        fs.mkdirSync(inboxDir, { recursive: true })
      } else {
        return
      }
    }
    if (fs.existsSync(inboxDir)) {
      for (let file of selected) {
        log.info(`Move file ${file}`)
        fs.copyFileSync(file, join(inboxDir, Path.basename(file)))
        fs.rmSync(file)
      }
    }
  }
}
