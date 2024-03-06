import { ShellClient } from '../ShellClient.js'

export class ShellClientMock extends ShellClient {
  calls = []

  async command(command: string, options?) {
    let { cwd } = this.defaultOptions
    let request = { command, cwd, ...options }
    let response = {}
    this.calls.push({ request, response })
    return {} as any
  }
}
