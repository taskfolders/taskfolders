import fs from 'fs'
import { findUpWorkspaceFolder } from '../findUpWorkspace.js'
import { WorkspaceIndex } from './WorkspaceIndex.js'

export const findWorkspaceForPath = async dir => {
  let ws = await findUpWorkspaceFolder(dir)
  let path = ws.dataDir({ join: ['workspace-index.json'] })
  let body = fs.readFileSync(path, 'utf-8').toString()
  let index = WorkspaceIndex.fromJSON(body, { path: ws.dir })
  index.pathBaseDir = ws.dir
  index.pathIndexFile = path
  index._refreshIndex()
  return { index, workspaceBaseDir: ws.dir, workspaceName: ws.data_std.sid }
}
