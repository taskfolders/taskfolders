import { ShellClient } from './ShellClient.js'

export async function shellHasCommand(cmd: string): Promise<boolean> {
  let isWindows = process.platform == 'win32'

  // TODO no support for now
  // https://github.com/mathisonian/command-exists/blob/master/lib/command-exists.js
  if (isWindows) return false

  let hasGPG = await ShellClient.query(`which ${cmd}`, {
    mustMock: false,
  })
    .then(x => true)
    .catch(e => false)
  return hasGPG
}
