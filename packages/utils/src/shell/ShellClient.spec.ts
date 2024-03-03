import { expect, describe, it } from 'vitest'

import { ShellClient } from './ShellClient.js'

it.skip('x query', async () => {
  //let res = await ShellCommand.query('pwd')
})

it('x - inherit #todo', async () => {
  let res = await ShellClient.execute('pwd', {
    inherit: true,
    cwd: '/tmp',
  })
  // console.log(res)
})

it('x echo #todo ', async () => {
  let res = await ShellClient.execute('pwd', {
    echo: true,
    cwd: '/tmp',
  })
  // console.log(res)
})
