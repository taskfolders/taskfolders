import * as nodeFS from 'node:fs'
import { $log, Logger } from '@taskfolders/utils/logger'
import { ShellClient, ShellError, setTabTitle } from '@taskfolders/utils/shell'
import { assertNever } from '@taskfolders/utils/types/assertNever'
import { join } from 'node:path'
import { ScriptApp } from '../scripts/ScriptApp.js'
import select from '@inquirer/select'
import { TaskFinder, ScriptItem } from './FindTasks.js'
import { DC } from '@taskfolders/utils/dependencies'
import * as Path from 'node:path'
import { shellHyperlink } from '@taskfolders/utils/screen'
import chalk from 'chalk'
import { TabSpinner } from '../TabSpinner.js'
import { ShellClientMock } from '@taskfolders/utils/shell/test'

class ShellTab {
  _title?: string

  setTitle(title: string) {
    this._title = title
    setTabTitle(title)
  }

  clear() {
    setTabTitle('')
  }

  isRunning = false
  async spin(kv?: { suffix?: string; atEnd?: () => void }) {
    if (this.isRunning) {
      return
    }
    let chain = ['|', '/', '-', '|', '/', '-']
    if (kv?.suffix) {
      chain = chain.map(x => [x, kv.suffix].join(' '))
    }
    let idx = 0
    this.isRunning = true

    return new Promise(resolve => {
      let tick = () => {
        let txt = chain[idx]
        console.log('--tick', txt)

        setTabTitle(txt)
        idx++
        if (idx === chain.length) {
          this.isRunning = false
          kv?.atEnd?.()
          resolve(null)
        } else {
          setTimeout(() => {
            tick()
          }, 100)
        }
      }

      tick()
    })
  }
}

export class TaskExecute {
  fs = nodeFS
  cwd = process.cwd()
  log = new Logger()
  shell: ShellClient
  //shell = DC.inject(ShellClient)
  finder: TaskFinder
  dc: DC

  constructor(kv: {
    fs: typeof nodeFS
    cwd: string
    shell: ShellClient
    finder: TaskFinder
    dc: DC
  }) {
    this.fs = kv.fs
    this.cwd = kv.cwd
    this.shell = kv.shell
    this.finder = kv.finder
    this.dc = kv.dc
  }

  async executePath(path: string, kv: { rest?: any } = {}) {
    let { fs } = this
    this.log.debug('Execute path', path)

    if (fs.statSync(path).isDirectory()) {
      // TODO #dedup

      let p1 = join(path, 'index.start.ts')
      if (fs.existsSync(p1)) {
        path = p1
      }

      p1 = join(path, 'index.script.ts')
      if (fs.existsSync(p1)) {
        path = p1
      }

      p1 = join(path, 'index.sh')
      if (fs.existsSync(p1)) {
        path = p1
      }

      p1 = join(path, 'index.py')

      if (fs.existsSync(p1)) {
        path = p1
      }
    }

    if (path.endsWith('.ts')) {
      let loaded = await import(path)
      if (path.includes('.start.')) return

      if ('runFromShell' in loaded) {
        let app = loaded
        let res = await app.runFromShell()
        if (!res) return
        if ('exitCode' in res) {
          return { exitCode: 1 }
        }
      } else if ('default' in loaded) {
        if (ScriptApp.is(loaded.default)) {
          let app = loaded.default
          let res = await app.runFromShell()
          if (!res) return
          if ('exitCode' in res) {
            return { exitCode: 1 }
          }
        } else {
          $log.debug('Not an script')
        }
      } else {
        throw Error('Could not execute task')
      }
    } else if (path.endsWith('.sh')) {
      await this.shell.command(`sh ${path}`, {
        stdio: 'inherit',
        verbose: true,
      })
    } else if (path.endsWith('.py')) {
      await this.shell.command(`python ${path}`, {
        stdio: 'inherit',
        verbose: true,
      })
    } else {
      throw Error(`Do not know how to execute ${path}`)
    }
  }

  async _executeName(query: string, kv: { rest?: any } = {}) {
    let all = await this.finder.findAll()
    let found = all.filter(x => x.key.includes(query))
    let task: ScriptItem
    if (found.length > 1) {
      let maxKeyLength = Math.max(...found.map(x => x.key.length))
      let a1 = found.map((x, idx) => {
        return {
          name: `${x.key.padEnd(maxKeyLength + 1)} ${x.title}`,
          value: idx,
        }
      })

      let answer = await select({
        message: 'Multiple tasks found. Which one?',
        choices: a1,
      })
      task = found[answer]
    } else if (found.length === 1) {
      task = found[0]
    } else {
      throw Error(`No task found :${query}`)
    }

    if (!task) {
      throw Error(`Could not find task :${query}`)
    }

    {
      let key = task.key
      if (task.position) {
        key = shellHyperlink({ text: key, path: task.position.path })
      }
      $log.put([chalk.cyan('Selected task'), key])
    }

    let { shell } = this
    let cwd = task.dir
    if (cwd !== process.cwd()) {
      $log.put(`+ cd ${cwd}`)
    }

    let cmd: string
    switch (task.type) {
      case 'npm': {
        cmd = `npm run ${task.key}`
        break
      }
      case 'md-script': {
        cmd = task.value.run
        break
      }
      case 'bin': {
        cmd = task.value
        break
      }
      case 'task-script': {
        let rel = Path.relative(task.dir, task.value)
        rel = Path.dirname(rel)
        $log.put(`+ tk ${rel}`)
        return await this.executePath(task.value)
      }
      default: {
        // TODO
        //assertNever(task.type)
        //throw Error(`Unknown task type :${task.type}`)
        throw Error(`Unknown task type`)
      }
    }
    let exitCode = 0

    let rest = kv.rest ?? ''
    cmd += ' ' + rest
    cmd = cmd.trim()

    let tab = new ShellTab()
    tab.setTitle(`tk|${task.key}`)

    let spinner = new TabSpinner()
    let hasError = false
    $log.put(`+ ${cmd}`)
    let timer: Timer
    let done = false

    let stdio = ['inherit', 'inherit', 'inherit'] as any
    if (process.env.TK_FF_INHERIT) {
      stdio = ['inherit', 'pipe', 'pipe']
    }
    await shell
      .command(cmd, {
        //inherit: false,
        stdio,
        env: { FORCE_COLOR: '1', ...process.env },
        cwd,
        async onData(ctx) {
          if (ctx.stderr) {
            process.stderr.write(ctx.stderr)
            if (hasError === false) {
              hasError = true

              // save timer and clear later
              // - prevents timer blocking 'tk' ending
              timer = setTimeout(() => {
                hasError = false
              }, 3_000)
            }
          }
          if (ctx.stdout) {
            process.stdout.write(ctx.stdout)
          }
          await spinner.spin({ suffix: task.key })

          let prefix = hasError ? '!!' : 'tk'
          // if (hasError) {
          //   setTimeout(() => {
          //     hasError = false
          //   }, 10_000)
          //   setTabTitle(`tk|${task.key}`)
          // }
          if (!done) tab.setTitle(`${prefix}|${task.key}`)
          // console.log('spin ends')
        },
      })
      .catch(e => {
        console.log({ ShellError })

        // @ts-expect-error
        if (ShellError.mustMock.is(e)) throw e
        // $log.dev(e)
        $log.error('Failed to execute command')
        exitCode = 1
      })
    done = true
    spinner.stop()

    clearTimeout(
      // @ts-expect-error TODO
      timer,
    )

    if (hasError) {
      let prefix = hasError ? '!!' : 'tk'
      tab.setTitle(`${prefix}|${task.key}`)
    } else {
      tab.clear()
    }

    return { exitCode }
  }
}
