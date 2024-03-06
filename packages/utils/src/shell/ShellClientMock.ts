import { ShellClient } from './ShellClient.js'

export class ShellClientMock extends ShellClient {
  calls = []

  async execute(command: string, options?) {
    let { cwd } = this
    let request = { command, cwd, ...options }
    let response = {}
    this.calls.push({ request, response })
    return {} as any
  }
}
