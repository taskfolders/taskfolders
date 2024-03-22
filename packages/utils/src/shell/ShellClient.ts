import {
  spawn,
  ChildProcess,
  StdioPipeNamed,
  StdioPipe,
  StdioNull,
} from 'child_process'
import { CustomError } from '../errors/CustomError.js'
import { join } from 'node:path'
const ensurePath = (x: string | string[]) => join(...[].concat(x))

export interface Options {
  /** print output while capturing */
  echo?: boolean

  /** @deprecated Use stdio */
  inherit?: boolean

  /** prevent execute when NODE_ENV === test */
  mustMock?: boolean

  cwd?: string | string[]

  stdio?:
    | StdioPipeNamed
    | StdioNull
    | (StdioPipe | StdioNull)[]
    | undefined
    | null
  env?: NodeJS.ProcessEnv

  /** print command before execute */
  verbose?: boolean

  onData?: (ctx: { output: Buffer; stdout?: Buffer; stderr?: Buffer }) => void

  autoStart?: boolean
}

export const ShellError = CustomError.defineGroup('ShellError', {
  execute: class extends CustomError<{ command; exitCode; stderr }> {
    message = 'Shell execution did fail'
  },
  notRunning: class extends CustomError<{ command: string }> {
    message = 'Cannot wait for non running command'
  },
  mustMock: class extends CustomError<{ command: string }> {
    message =
      'Shell executions disabled under test. Did you forget mocking this call?'
  },
})

export interface ExecuteResult {
  isStarted: boolean
  stdout: Buffer
  stderr: Buffer
  output: Buffer
  done(): Promise<{ ok: true } | { ok: false; error }>
  start()
}

export class ShellClient {
  child: ChildProcess
  options: Options = {}

  constructor(kv: Options = {}) {
    this.options = kv
    this.options.cwd ??= process.cwd()
  }

  static create(ops: Options = {}) {
    let obj = new this()
    obj.options = ops
    return obj
  }

  static async command(command: string, ops: Options = {}): Promise<void> {
    await this.create().command(command, ops)
  }

  static async query(command: string, ops: Options = {}): Promise<string> {
    return await this.create().query(command, ops)
  }

  async command(command: string, ops: Options = {}): Promise<void> {
    let run = await this.execute(command, ops)
    run.start()
    let res = await run.done()
    if (res.ok === false) throw res.error
  }

  async query(command: string, ops: Options = {}): Promise<string> {
    let run = await this.execute(command, {
      verbose: false,
      ...ops,
      stdio: null,
    })
    run.start()
    await run.done()
    return run.output.toString().trim()
  }

  /** @deprecated Unstable interface, use .command or .query */
  execute(command: string, ops: Options = {}): ExecuteResult {
    if (process.env.NODE_ENV === 'test' && ops.mustMock !== false) {
      throw ShellError.mustMock.create({ command })
    }

    //let { command, args } = this
    let args = []
    let options = { ...this.options, ...ops }
    options.cwd ??= process.cwd()
    let cwd = ensurePath(options.cwd)
    if (options.verbose) console.log('+', command)
    const child = spawn(command, args, {
      cwd,
      shell: true,
      stdio: ops.inherit ? 'inherit' : (options.stdio as any),
      env: options.env,
    })
    this.child = child

    // TODO memory leak #bug #risk
    // long running process will saturate this.. but need to capture first traces for errors
    let stderr = []
    let stdout = []
    let output = []

    let running

    let start = () => {
      if (result.isStarted) {
        return
      }
      result.isStarted = true
      running = new Promise((resolve, reject) => {
        child.stdout?.on('data', data => {
          stdout.push(data)
          output.push(data)
          options.onData?.({ stdout: data, output: data })

          if (ops.echo) {
            process.stdout.write(data.toString())
          }
          // console.log(`stderr: ${data}`)
          // console.log(`stdout: ${data}`)
        })

        child.stderr?.on('data', data => {
          stderr.push(data)
          output.push(data)
          options.onData?.({ stderr: data, output: data })
          // console.log(`stderr: ${data}`)
        })

        child.on('error', cause => {
          console.log(`error: ${cause.message}`)
          // $dev('todo? throw error?')
        })

        child.on('close', exitCode => {
          if (exitCode === 0) {
            resolve({ ok: true })
          } else {
            let error = ShellError.execute.create({
              command: [command, args].join(' '),
              exitCode,
              stderr: Buffer.concat(stderr).toString(),
            })
            reject(error)
            //resolve({ ok: false, error })
          }
        })
      })
    }

    // TODO should this be ShellCommand? or new class ShellCommandRun -ning
    let result: ExecuteResult = {
      isStarted: false,
      // pid: child.pid,
      stdout: null,
      stderr: null,
      output: null,
      start,

      async done() {
        if (!running) {
          throw new ShellError.notRunning()
        }
        let res = await running

        this.stdout = Buffer.concat(stdout)
        this.stderr = Buffer.concat(stderr)
        this.output = Buffer.concat(output)
        return res

        // let stdout = Buffer.concat(stdout)
        // return { stdout, stderr, output }
      },
    }

    //console.log('..auto start', options.autoStart)
    if (options.autoStart !== false) {
      start()
    }

    return result
  }
}
