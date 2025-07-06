import { expect, describe, it } from 'vitest'

import * as Path from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { TaskFolderDirectory } from './TaskFolderDirectory.js'

export const __dirname = Path.dirname(fileURLToPath(import.meta.url))

class TaskFolderFile {}

it.skip('x', async () => {
  let dir = Path.join(__dirname, './_test/samples/json')
  let sut = await TaskFolderDirectory.fromDir(dir)
  // $dev(sut)
})
