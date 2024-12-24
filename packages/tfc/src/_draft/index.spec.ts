import { expect, describe, it } from 'vitest'
import * as Path from 'path'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
import {
  TaskFoldersMarkdown,
  MarkdownDocument,
} from '@taskfolders/utils/markdown'
import * as fs from 'fs'
import { readFileSync } from 'fs'
import { TaskFolderDirectory } from './directory/TaskFolderDirectory.js'
import { WorkspaceRepo } from './WorkspaceRepo.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const findWorkspaceUp = async (dir: string) => {
  let all = findUpAll({ startFrom: dir, findName: 'index.md' })

  let found
  for (let x of all) {
    let body = fs.readFileSync(x).toString()
    let md = await MarkdownDocument.fromBody<any>(body)
    //let md = await TaskFoldersMarkdown.fromBody(body)
    let thing = md.data?.flags
    if (!thing) continue
    let flags = [].concat(thing)
    if (flags.includes('workspace')) {
      let dir = Path.dirname(x)
      found = { path: x, dir }
    }
  }
  return found
}

class TaskFoldersGlobal {
  index: { path; workspaces }
  config: { path }
}

it('x', async () => {
  let dir = Path.join(__dirname, '../../../../samples', 'ws-1/action/now')
  let dirBase = Path.join(__dirname, '../../../../samples/ws-1')
  const wsJoin = (...args) => Path.join(dirBase, ...args)

  let md_1_path = wsJoin('action/now/index.md')

  let res = await findWorkspaceUp(dir)
  let ws = await TaskFolderDirectory.fromDir(res.dir)
  let repo = new WorkspaceRepo({ pathBase: res.dir })
  let md_1_body = fs.readFileSync(md_1_path).toString()

  let md_1 = await TaskFoldersMarkdown.fromBodyMaybe(md_1_body, {
    coerce: true,
  })
  await repo.indexMarkdown({ markdown: md_1, path: md_1_path })

  let md_2_path = wsJoin('action/now/learn-tf.md')
  let md_2_body = fs.readFileSync(md_2_path).toString()
  let md_2 = await TaskFoldersMarkdown.fromBodyMaybe(md_2_body, {
    coerce: true,
  })
  await repo.indexMarkdown({ markdown: md_2, path: md_2_path })

  // console.log(repo.index)
  // await repo.save()
  // console.log({ res, ws, md })
})
