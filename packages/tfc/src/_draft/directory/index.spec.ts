import { expect, describe, it } from 'vitest'

import * as Path from 'path'
import { readFileSync } from 'fs'
import { TaskFolderDirectory } from './__dirname.js'
import { fileURLToPath } from 'url'

export const __dirname = Path.dirname(fileURLToPath(import.meta.url))

class TaskFolderFile {}

it('x', async () => {
  let dir = Path.join(__dirname, './_test/samples/json')
  let sut = await TaskFolderDirectory.fromDir(dir)
  $dev(sut)
})
