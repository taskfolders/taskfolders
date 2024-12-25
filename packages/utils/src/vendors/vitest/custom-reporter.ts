/**
 * DOC
 * https://main.vitest.dev/advanced/reporters
 *
 * Great example:
 * https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/reporters/base.ts
 */
import type { Vitest } from 'vitest/node'
import {
  Reporter,
  BaseReporter,
  VerboseReporter,
  BasicReporter,
  DefaultReporter,
} from 'vitest/reporters'
import * as VR from 'vitest/reporters'
import type { TaskResultPack, Task } from '@vitest/runner'
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

  end: number
  testCount
  passedCount
  failedCount
  skippedCount
  ctx: Vitest

  constructor() {
    // super()
    this.testCount = 0
    this.passedCount = 0
    this.failedCount = 0
    this.skippedCount = 0
  }

  onInit(context: Vitest) {
    // console.log('\n=== Custom Verbose Reporter Initialized ===')
    this.ctx = context
  }

  // protected printTask(task: Task): void {
  //   super.printTask(task)
  // }
  onTaskUpdate(packs: TaskResultPack[]) {
    for (const pack of packs) {
      const task = this.ctx.state.idMap.get(pack[0])

      if (task) {
        this.printTask(task)
      } else {
        console.log('Task not found:')
      }
    }
  }

  printTask(task: Task) {
    if (task.type === 'suite') {
      if (task.result?.state === 'run') {
        // before
        console.log(`${chalk.cyan('SUITE')}: ${task.name}`)
      }
    }

    if (
      !('filepath' in task) ||
      !task.result?.state ||
      task.result?.state === 'run' ||
      task.result?.state === 'queued'
    ) {
      return
    }

    if (task.result?.note) {
      throw Error('TODO note')
    }

    const tests = getTests(task)
    for (const test of tests) {
      let parts: string[] = []
      if (test.logs) {
        parts.push(chalk.blue('+stdout'))
      }
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
  onTestFinished(test) {
    const status = test.result?.state || 'unknown'
    this.testCount += 1

    if (status === 'pass') this.passedCount += 1
    else if (status === 'fail') this.failedCount += 1
    else if (status === 'skip') this.skippedCount += 1

    console.log(`  ${status.toUpperCase()}: ${test.name}`)
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
    console.log('\n\n')
    console.log(
      `Total:${this.testCount} Passed:${this.passedCount} Failed:${this.failedCount} Skipped:${this.skippedCount}`,
    )
    // console.log({ failedSuites, failedTests, failedTotal })

    if (failedTotal > 0) {
      console.error(`\nERRORS:`)
      failedTests.forEach((test, index) => {
        console.error(`${index + 1}: ${test.location}`)
        console.log(' ', test.name)
        console.log(' ', test.file.name)
        test.result?.errors?.forEach(err => {
          this.ctx.logger.printError(err)
        })

        // console.log(test)
      })
    } else {
      console.log('All tests passed successfully!')
    }
  }
}
