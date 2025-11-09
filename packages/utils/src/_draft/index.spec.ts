import { expect, describe, it } from 'vitest'

import * as Path from 'path'
import * as fs from 'fs'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { extractFrontMatter } from '../markdown/extractFrontMatter.js'
import { MarkdownDocument } from '../markdown/index.js'

export const __dirname = Path.dirname(fileURLToPath(import.meta.url))

class TaskFolderFile {}

async function fetchDirConfig(dir: string) {
  let all = []
  let parts = dir.split(Path.sep)
  let backDirs = parts
    .map((part, idx) => {
      let rel = parts.slice(0, parts.length - idx).join(Path.sep)
      return rel
    })
    .filter(Boolean)

  //

  backDirs.map(dir => {
    let info: { dir?; indexMarkdown?; dataDir? } = {}
    // console.log('dir', dir)
    let dirFiles = fs.readdirSync(dir)
    let dataDir = dirFiles.find(f => {
      if (f === '_data') return f
    })
    let indexMarkdown = dirFiles.find(f => {
      if (['index.md', 'README.md'].includes(f)) return f
    })

    if (dataDir) {
      let full = Path.join(dir, dataDir)
      let dirFiles = fs.readdirSync(full)
      info.dataDir = full
      // console.log('FOUND DATA DIR:', { full, dirFiles })
    }
    if (indexMarkdown) {
      let body = readFileSync(Path.join(dir, indexMarkdown), 'utf-8')
      let md = MarkdownDocument.fromBody(body, { implicitFrontmatter: true })
      //let data = extractFrontMatter(body, { guess: true }).frontData
      let data = md.data
      info.indexMarkdown = { fileName: indexMarkdown, data }
      // console.log('FOUND INDEX MD:', { indexMarkdown, data })
    }
    // console.log({ dataDir, indexMarkdown })

    if (!isEmpty(info)) {
      all.push({ dir, ...info })
    }
  })
  return { all }
}

it('x', async () => {
  let dir = Path.join(
    process.env.HOME,
    'work/fgo/action/now-fgo/comptia-security-701',
  )
  let res = await fetchDirConfig(dir)
  // let sut = await TaskFolderDirectory.fromDir(dir)
  $dev(res)
})
function isEmpty(info: any) {
  if (!info) return true
  if (typeof info === 'object') return Object.keys(info).length === 0
  return false
}
