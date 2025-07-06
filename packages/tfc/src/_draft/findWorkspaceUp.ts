import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
import { MarkdownDocument } from '@taskfolders/utils/markdown'
import * as FS from 'fs'
import * as Path from 'path'
import { StandardMetadata } from './next/StandardMetadata.js'

export const findWorkspaceUp = async (dir: string, fs = FS) => {
  let all = findUpAll({
    startFrom: dir,
    fs,
    // @ts-expect-error TODO
    test(x) {
      let path = Path.join(x, 'index.md')
      let acu = []
      // if (fs.existsSync(path)) acu.push(path)
      // path = Path.join(x, 'index.json')
      if (fs.existsSync(path)) acu.push(path)
      // path = Path.join(x, '.index.json')
      // if (fs.existsSync(path)) acu.push(path)
      path = Path.join(x, '.index.md')
      if (fs.existsSync(path)) acu.push(path)
      return acu
    },
  }).flat()

  let found

  for (let x of all) {
    let body = fs.readFileSync(x).toString()
    let md = await MarkdownDocument.fromBody<any>(body, {
      implicitFrontmatter: true,
    })
    //let md = await TaskFoldersMarkdown.fromBody(body)
    let meta = StandardMetadata.fromJSON(md.data)

    if (meta.flags.includes('workspace')) {
      let dir = Path.dirname(x)
      found = { path: x, dir }
    }
  }
  return found
}
