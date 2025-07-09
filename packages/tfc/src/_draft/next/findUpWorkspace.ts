import { join } from 'path/posix'
import { Folder } from './Folder.js'
import { $dev } from '../../dc.js'

// TODO dedup with findWorkspaceUp
export async function findUpWorkspaceFolder(dir) {
  let workspace: Folder
  let dir_now = dir
  while (dir_now !== '/') {
    let folder = new Folder(dir_now)
    await folder.parse()
    // console.log(dir_now, folder.isWorkspace(), folder.data)
    if (folder.isWorkspace()) {
      workspace = folder
      // TODO log.debug('found workspace', dir)
      break
    }
    dir_now = join(dir_now, '..')
  }

  if (!workspace) {
    throw new Error(`No workspace found in ${dir}`)
  }
  return workspace
}
