import { ExecuteResult, Options, ShellClient } from '../ShellClient.js'

export class ShellClientMock extends ShellClient {
  calls = []

  static fromClient(sh: ShellClient) {
    let obj = new this()
    obj.defaultOptions = sh.defaultOptions
    return obj
  }

  async command(command: string, options?) {
    let { cwd } = this.defaultOptions
    let request = { command, cwd, ...options }
    let response = {}
    this.calls.push({ request, response })
    return {} as any
  }

  execute(command: string, ops: Options = {}): ExecuteResult {
    let res = super.execute(command, ops)
    // res.done().then(x => {
    //   return x
    // })
    return res
  }
}
