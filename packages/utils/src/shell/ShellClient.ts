import { spawn, ChildProcess } from 'child_process'

interface Options {
  echo?: boolean
  inherit?: boolean
  cwd?: string
}
export class ShellClient {
  child: ChildProcess

  static async execute(command: string, ops: Options = {}) {
    let obj = new this()
    return await obj.execute(command, ops)
  }

  static async query(command: string) {
    let obj = new this()
    let res = await obj.execute(command)
    return res.stdout.trim()
  }

  async execute(command: string, ops: Options = {}) {
    //let { command, args } = this
    let args = []
    const child = spawn(command, args, {
      cwd: ops.cwd,
      shell: true,
      stdio: ops.inherit ? 'inherit' : undefined,
    })
    this.child = child
    let stderr = ''
    let stdout = ''
    let output = ''

    let running = new Promise((resolve, reject) => {
      child.stdout?.on('data', data => {
        let next = data.toString()
        stdout += next
        output += next
        if (ops.echo) {
          process.stdout.write(next)
        }
        // console.log(`stderr: ${data}`)
        // console.log(`stdout: ${data}`)
      })

      child.stderr?.on('data', data => {
        stderr += data.toString()
        output += data.toString()
        console.log(`stderr: ${data}`)
      })

      child.on('error', cause => {
        console.log(`error: ${cause.message}`)
        // $dev('todo? throw error?')
      })

      child.on('close', exitCode => {
        if (exitCode === 0) {
          resolve(null)
        } else {
          let error = Error('Command fail')
          error.name = 'ShellError'
          // @ts-expect-error TODO
          error.data = {
            command: [command, args].join(' '),
            exitCode,
            stderr,
          }
          reject(error)
        }
      })
    })

    // TODO should this be ShellCommand? or new class ShellCommandRun -ning
    await running
    return {
      pid: child.pid,
      stdout,
      stderr,
      output,
      async done() {
        await running
      },
    }
  }
}
