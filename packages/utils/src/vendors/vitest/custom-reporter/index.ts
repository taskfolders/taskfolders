/**
 * DOC
 * https://main.vitest.dev/advanced/reporters
 *
 * Great example:
 * https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/reporters/base.ts
 */
import type { Vitest } from 'vitest/node'
import { shellHyperlink } from '@taskfolders/utils/screen'
import {
  Reporter,
  BaseReporter,
  VerboseReporter,
  BasicReporter,
  DefaultReporter,
} from 'vitest/reporters'
import * as VR from 'vitest/reporters'
import type { TaskResultPack, Task, Test } from '@vitest/runner'
import { getCurrentTest } from '@vitest/runner'
import chalk from 'chalk'
import type { RunnerTestFile } from 'vitest'
import { getSuites, getTests } from '@vitest/runner/utils'

function countTestErrors(tasks) {
  return tasks.reduce((c2, i) => c2 + (i.result?.errors?.length || 0), 0)
}

// export default class VerboseCustomReporter extends VerboseReporter {
export default class VerboseCustomReporter implements Reporter {
  // export default class VerboseCustomReporter extends BaseReporter {
  // protected verbose = false
  // renderSucceed = true

  start: number
  end: number

  passedCount
  failedCount
  skippedCount
  ctx: Vitest

  // TODO dirty
  printMode = []

  constructor() {
    // super()
    this.passedCount = 0
    this.failedCount = 0
    this.skippedCount = 0
  }

  onInit(context: Vitest) {
    // console.log('\n=== Custom Verbose Reporter Initialized ===')
    this.ctx = context
    this.start = performance.now()
  }

  // protected printTask(task: Task): void {
  //   super.printTask(task)
  // }
  onTaskUpdate(packs: TaskResultPack[]) {
    for (const pack of packs) {
      const task = this.ctx.state.idMap.get(pack[0])
      // console.log('--', task.name)

      if (task) {
        this.printTask_3(task)
      } else {
        console.log('Task not found:')
      }
    }
  }

  onCollected(foo) {
    // console.log('collected', foo[0].tasks.at(-1))
    // let t1 = getTests(foo[0].tasks.at(-1))
  }

  printTask_3(task: Task) {
    if (
      !('filepath' in task) ||
      !task.result?.state ||
      task.result?.state === 'run' ||
      task.result?.state === 'queued'
    ) {
      return
    }

    let all = getTests(task)

    // let all = getSuites(task)
    let indent = 0

    const getTitles = (task: Task) => {
      let acu = []

      while (task.suite) {
        acu.push(task.suite.name)
        task = task.suite
      }
      return acu
    }

    let hasErrors = all.some(test => test.result?.state === 'fail')
    let hasNow = all.some(test => /#now\b/.test(test.name))

    if (hasErrors) this.printMode.push('focus-errors')
    if (hasNow) this.printMode.push('focus-now')

    all.map(test => {
      if (test.suite) {
        // console.log(' '.repeat(indent * 2), test.suite.name)
        // console.log(' '.repeat(indent * 2), test.suite.suite?.name)
      }

      // STEP stats
      if (test.mode === 'skip') {
        this.skippedCount++
      } else if (test.result?.state === 'pass') {
        this.passedCount++
      } else if (test.result?.state === 'fail') {
        this.failedCount++
      }

      // STEP hide cases
      let state = test.result?.state
      if (hasErrors) {
        if (state !== 'fail') return
      } else if (hasNow) {
        if (!test.name.includes('#now')) return
      }

      let status
      if (test.mode === 'skip') {
        if (!process.env.REPORTER_OPTIONS?.includes('hide-skip')) {
          status = chalk.cyan('SKIP')
        }
      } else if (test.mode === 'run') {
        if (test.result?.state === 'pass') {
          status = chalk.green('OK')
        } else if (test.result?.state === 'fail') {
          status = chalk.red('FAIL')
        } else {
          console.error('UNKNOWN status', test.result?.state)
        }
      }

      let testName = test.name.replace(/(#\S+)/g, match => chalk.yellow(match))
      let titles = [...getTitles(test).map(x => chalk.dim(x)), testName]
      console.log(chalk.dim('T'), titles.join(' / '), status)

      if (status) {
        test.logs?.forEach(log => {
          let lines = log.content.split('\n')
          lines.forEach(line => {
            if (log.type === 'stdout') {
              console.log(`  : ${chalk.dim(line)}`)
            } else {
              console.log(`  ${chalk.magenta('stderr')}: ${chalk.dim(line)}`)
            }
          })
        })
      }
    })

    // console.log('Prints', prints.join(' +'))
    // console.log(all.map(x => x.name))
    // console.log(all.at(-1))
  }

  printTask_2(task: Task) {
    let all = getSuites(task)
    all.forEach(suite => {
      console.log(`${chalk.cyan('SUITE')}: ${task.name}`)
      console.log(suite.tasks.map(x => x.name))
    })
  }

  printTask(task: Task) {
    if (task.type === 'suite') {
      // if (task.result?.state === 'run') {
      // before
      console.log(`${chalk.cyan('SUITE')}: ${task.name}`)
      // console.log(all[0].tasks.at(-1).mode)
      // }
    }

    if (
      !('filepath' in task) ||
      !task.result?.state ||
      task.result?.state === 'run' ||
      task.result?.state === 'queued'
    ) {
      return
    }

    // if (task.result?.note) {
    //   throw Error('TODO note')
    // }

    const tests = getTests(task)
    for (const test of tests) {
      let parts: string[] = []
      if (test.logs) {
        parts.push(chalk.blue('+stdout'))
      }
      // console.log('See..', test)
      // console.log('Test:', test.name, test.result?.state)
      if (test.type !== 'test') {
        throw Error(`Unknown type: ${test.type}`)
      }

      let status
      if (test.mode === 'skip') {
        this.skippedCount++
        if (!process.env.REPORTER_OPTIONS?.includes('hide-skip')) {
          status = chalk.cyan('SKIP')
        }
      } else if (test.mode === 'run') {
        if (test.result?.state === 'pass') {
          this.passedCount++

          status = chalk.green('OK')
        } else if (test.result?.state === 'fail') {
          this.failedCount++

          status = chalk.red('FAIL')
        } else {
          console.error('UNKNOWN status', test.result?.state)
        }
      }

      if (status) {
        let testName = test.name.replace(/(#\w+)/g, match =>
          chalk.yellow(match),
        )
        console.log(`  ${testName} -- ${status} ${parts.join(' ')}`)

        test.logs?.forEach(log => {
          let lines = log.content.split('\n')
          lines.forEach(line => {
            if (log.type === 'stdout') {
              console.log(`    ${chalk.dim(line)}`)
            } else {
              console.log(`    stderr: ${chalk.dim(line)}`)
            }
          })
        })
      }
    }
  }

  onStart(files) {
    console.log(`\nStarting tests for ${files.length} file(s)...`)
  }

  onSuiteStart(suite) {
    console.log(`\nSuite: ${suite.name}`)
  }

  onTestStart(test) {
    console.log(`  Running test: ${test.name}`)
  }

  onTestSkip() {
    console.error('Found test skip')
    throw Error('Found test skip')
  }

  onSuiteEnd(suite) {
    console.log(`\nFinished suite: ${suite.name}`)
  }

  onFinished(
    files = this.ctx.state.getFiles(),
    errors = this.ctx.state.getUnhandledErrors(),
  ) {
    this.end = performance.now()
    this.reportSummary(files, errors)
  }

  reportSummary(files: RunnerTestFile[], errors) {
    const suites = getSuites(files)
    const tests = getTests(files)

    const failedSuites = suites.filter(i => i.result?.errors)
    const failedTests = tests.filter(i => i.result?.state === 'fail')
    const failedTotal =
      countTestErrors(failedSuites) + countTestErrors(failedTests)

    // console.log('\n=== Test Run Summary ===')
    // console.log('\n\n')
    let total = this.passedCount + this.failedCount + this.skippedCount
    console.log()

    let failCount = this.failedCount > 0 ? chalk.red(this.failedCount) : '0'
    let passCount = this.passedCount > 0 ? chalk.green(this.passedCount) : '0'
    let skipCount =
      this.skippedCount > 0 ? chalk.yellow(this.skippedCount) : '0'

    let duration = this.end - this.start
    let parts = [
      `Pass:${passCount} Fail:${failCount} Skip:${skipCount}`,
      ...this.printMode.map(x => `+${chalk.dim.green(x)}`),
      `${(duration / 1_000).toFixed(3)}s`,
    ]

    console.log(
      // `Total:${total} Passed:${this.passedCount} Failed:${this.failedCount} Skipped:${this.skippedCount}`,
      parts.join(' '),
    )
    // console.log({ failedSuites, failedTests, failedTotal })

    if (failedTotal > 0) {
      console.error(`\nERRORS:`)
      failedTests.forEach((test, index) => {
        let link = test.name

        // TODO extract?
        let location = test.result?.errors[0].stack
          .split('\n')[1]
          .split(' ')
          .at(-1)

        let [file, line, col] = location.split(':')

        link = shellHyperlink({ text: link, path: file, lineNumber: line })
        console.error(`${index + 1}: ${link}`)

        test.result?.errors?.forEach(err => {
          this.ctx.logger.printError(err)
        })

        // console.log(test)
      })
    } else {
      // console.log('All tests passed successfully!')
    }
  }
}
