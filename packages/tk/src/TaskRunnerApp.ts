import '@taskfolders/utils/logger/node/register.start'
import '@taskfolders/utils/native/object/groupBy.polyfill'

import Yargs from 'yargs'
import * as nodeFS from 'node:fs'
import * as Path from 'node:path'

import { Logger } from '@taskfolders/utils/logger'
import { ShellClient } from '@taskfolders/utils/shell'
import { TaskFinder } from './handlers/FindTasks.js'
import { TaskExecute } from './handlers/ExecuteTask.js'
import { DC, DependencyToken } from '@taskfolders/utils/dependencies'
import { ShowTasks } from './handlers/ShowTasks.js'

let fsToken = DependencyToken.define({
  //name: 'DateNowToken',
  type: 'transient',
  create() {
    return nodeFS
  },
})

export class TaskRunnerApp {
  fs = nodeFS
  cwd = process.cwd()
  log = new Logger()
  shell = new ShellClient()
  finder: TaskFinder
  runner: TaskExecute
  dc = new DC()

  constructor() {
    let { dc, fs, cwd, shell } = this
    let fs_next = this.dc.fetch(DependencyToken)

    this.finder = new TaskFinder({ fs, cwd, dc })
    this.runner = new TaskExecute({
      fs,
      cwd,
      shell,
      dc,
      finder: this.finder,
    })
    dc.finish(this.runner)
  }

  async _executeShowAllTasks() {
    await new ShowTasks(this.finder).execute()
  }

  async executeRequest(kv: { line: string } | { argv: string[] }) {
    let { fs } = this
    let out = Yargs(process.argv.slice(2)).scriptName('tk')

    let res = await out.parse(
      // @ts-expect-error TODO
      kv.line ?? kv.argv,
    )
    let [thing, ...rest] = res._.map(x => x.toString())

    if (res.shell) {
      // TODO watch and monitor
    }
    if (!thing) {
      return await this._executeShowAllTasks()
    }

    let result: { exitCode?: number } | undefined
    let path = Path.isAbsolute(thing) ? thing : Path.join(process.cwd(), thing)
    if (fs.existsSync(path)) {
      result = await this.runner.executePath(path, { rest })
    } else {
      result = await this.runner._executeName(thing, { rest })
    }
    if (result?.exitCode) {
      process.exitCode = result.exitCode
    }
  }
}
