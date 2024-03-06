import { spawn, ChildProcess } from 'child_process'
import { CustomError } from '../errors/CustomError.js'

interface Options {
  echo?: boolean
  inherit?: boolean
  mustMock?: boolean
  cwd?: string
}

export const ShellError = CustomError.defineGroup('ShellError', {
  mustMock: class extends CustomError<{ command: string }> {
    message =
      'Shell executions disabled under test. Did you forget mocking this call?'
  },
})

export class ShellClient {
  child: ChildProcess
  defaultOptions: Options = {}

  constructor(kv: { cwd?: string } = {}) {
    this.defaultOptions.cwd = kv.cwd ?? process.cwd()
  }

  static create(ops: Options = {}) {
    let obj = new this()
    obj.defaultOptions = ops
    return obj
  }

  static async command(
    command: string,
    ops: Options = {},
  ): Promise<{ stdout; stderr }> {
    return await this.create().command(command, ops)
  }

  static async query(
    command: string,
    ops: Options = {},
  ): Promise<{ stdout; stderr }> {
    return await this.create().query(command, ops)
  }

  async command(
    command: string,
    ops: Options = {},
  ): Promise<{ stdout; stderr }> {
    let run = await this.execute(command, ops)
    run.start()
    let res = await run.done()
    return res
  }

  async query(command: string, ops: Options = {}): Promise<{ stdout; stderr }> {
    let run = await this.execute(command, ops)
    run.start()
    let res = await run.done()
    return res.output.toString()
  }

  execute(
    command: string,
    ops: Options = {},
  ): Promise<{ stdout; stderr; output; done; start }> {
    if (process.env.NODE_ENV === 'test' && ops.mustMock !== false) {
      throw ShellError.mustMock.create({ command })
    }

    //let { command, args } = this
    let args = []
    let options = { ...this.defaultOptions, ...ops }
    options.cwd ??= process.cwd()
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: true,
      stdio: ops.inherit ? 'inherit' : undefined,
    })
    this.child = child
    let stderr = ''
    let stdout = ''
    let stdout_acu = []
    let output = ''

    let running
    let start = () => {
      running = new Promise((resolve, reject) => {
        child.stdout?.on('data', data => {
          let next = data.toString()
          stdout_acu.push(data)
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
    }

    // TODO should this be ShellCommand? or new class ShellCommandRun -ning
    return {
      // pid: child.pid,
      stdout,
      stderr,
      output,
      start,

      async done() {
        await running
        let stdout = Buffer.concat(stdout_acu)
        return { stdout, stderr, output }
      },
    }
  }
}
