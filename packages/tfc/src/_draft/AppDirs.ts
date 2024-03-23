import { DC } from '@taskfolders/utils/dependencies'
import envPaths from 'env-paths'
import * as Path from 'node:path'
import { LocalFileSystem } from '@taskfolders/utils/fs'
import yaml from 'yaml'
import { AppSettings } from './AppSettings.js'

let defaultConfig = new AppSettings()

export class AppDirs {
  fs = DC.inject(LocalFileSystem)
  _config: string

  constructor() {
    let dirs = envPaths('TaskFolders.com', { suffix: '' })
    let dir = process.env.TASKFOLDERS_CONFIG_DIR
    if (dir) {
      dirs = { ...dirs, config: dir }
    }
    this._config = dirs.config
  }

  configPath(...x: string[]) {
    return Path.join(this._config, ...x)
  }

  ensure() {
    let { fs } = this
    fs.raw.mkdirSync(this._config, { recursive: true })
    let pa = this.configPath('config.yml')

    let doc = yaml.stringify(defaultConfig)
    fs.raw.writeFileSync(pa, doc)
  }

  configData() {
    let pa = this.configPath('config.yml')
    let data = this.fs.read(pa, { unsafe: true })
    if (!data) {
      this.fs.write
      // TODO create at this point
      return defaultConfig
    }
    return defaultConfig
  }
}

DC.decorate(AppDirs, { lifetime: 'singleton' })
