import { expect, describe, it } from 'vitest'
import { findWorkspaceUp } from './findWorkspaceUp.js'
import { join } from 'path'
import { log } from '../dc.js'

it('x', async () => {
  let dir = join(process.env.HOME, 'repos/play/python/todos')
  let res = await findWorkspaceUp(dir)
  log.dev(res)
})
