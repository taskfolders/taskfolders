import { TaskRunnerApp } from './TaskRunnerApp.js'

if (process.env.VERBOSE === '1') {
  if (typeof Bun !== 'undefined') {
    console.log(': Bun runtime is available!')
  } else {
    console.log(': Bun runtime is not available, falling back to Node.js')
  }
}

async function main() {
  let app = new TaskRunnerApp()
  await app.executeRequest({ argv: process.argv.slice(2) })
}

main()
