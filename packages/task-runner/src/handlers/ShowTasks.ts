import chalk from 'chalk'
import { $log } from '@taskfolders/utils/logger'
import { shellHyperlink } from '@taskfolders/utils/screen'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'
import { atomicDuration } from '@taskfolders/utils/native/date/atomicDuration'
import { TaskFinder } from './FindTasks.js'

export class ShowTasks {
  //finder: TaskFinder
  constructor(public finder: TaskFinder) {}

  async execute() {
    let allTasks = await this.finder.findAll()

    let maxKeyLength = Math.max(...allTasks.map(x => x.key.length))
    let byDir = Object.groupBy(allTasks, task => task.dir)

    // #ux Sort entries by path length
    // - assume most frequent tasks are closest to PWD
    let entries = Object.entries(byDir).sort(
      (lhs, rhs) => lhs[0].length - rhs[0].length,
    )

    if (entries.length === 0) {
      $log.error('No tasks found')
      // TODO
      // process.exitCode = 1
      return
    }

    for (let [dir, dirTasks] of entries) {
      let dir_link = shellHyperlink({ path: dir })
      $log.put('').put(chalk.blue(dir_link))

      // @ts-ignore TODO
      for (let task of dirTasks) {
        let tn = task.type as any
        let type = `(${chalk.dim(tn)})`
        let key = task.key //.padEnd(maxKeyLength + 1)
        if (task.position) {
          key = shellHyperlink({
            text: key,
            path: task.position.path,
            lineNumber: task.position.lineNumber,
          })
        }
        key = padEnd(key, maxKeyLength + 1)
        let parts = [key, task.title]

        if (task.type === 'task-script') {
          let { data } = task
          if (data) {
            //let diff = new Date().getTime() - data.timestamp.getTime()
            let time = atomicDuration(data.timestamp)
            let ok = data.ok ? chalk.green('OK') : chalk.red('Error')
            parts = parts.concat(['  |  ', ok, chalk.dim(time)])
          }
        }
        $log.put(parts)
      }
    }
  }
}
