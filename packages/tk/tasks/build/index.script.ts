// import { FolderScript } from '@taskfolders/scripts/FolderScript';
import { ScriptApp } from '../../src/scripts/ScriptApp.js'
import { ShellClient } from '@taskfolders/utils/shell'
import { $log } from '@taskfolders/utils/logger'

export default ScriptApp.create({
  dirData: true,
  dirBuild: '_build',

  async execute(ctx) {
    let sh = ShellClient.create({ verbose: true })
    await sh.command('rm -rf dist')
    await sh.command('npx tsc')
  },
})
