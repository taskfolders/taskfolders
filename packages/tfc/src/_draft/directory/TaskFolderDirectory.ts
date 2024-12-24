import * as fs from 'fs'
import * as Path from 'path'
import { fileURLToPath } from 'url'
import { MarkdownDocument } from '@taskfolders/utils/markdown'

class Foo {}

async function parseFolder(dir: string) {
  let files = fs.readdirSync(dir)
  let data
  if (files.includes('index.json')) {
    let path = Path.join(dir, 'index.json')
    let body = fs.readFileSync(path).toString()
    data = JSON.parse(body)
  } else if (files.includes('.index.json')) {
    let path = Path.join(dir, 'index.json')
    let body = fs.readFileSync(path).toString()
    data = JSON.parse(body)
    throw Error('todo')
  } else if (files.includes('.index.yaml')) {
    throw Error('todo')
  } else if (files.includes('.index.yml')) {
    throw Error('todo')
  } else if (files.includes('index.yml')) {
    throw Error('todo')
  } else if (files.includes('index.yaml')) {
    throw Error('todo')
  }

  let text
  if (files.includes('.index.md')) {
    throw Error('todo')
  } else if (files.includes('index.md')) {
    let path = Path.join(dir, 'index.md')
    text = fs.readFileSync(path).toString()
  } else if (files.includes('index.mdown')) {
    throw Error('todo')
  } else if (files.includes('README.md')) {
    throw Error('todo')
  }

  let markdown: MarkdownDocument
  if (text) {
    markdown = await MarkdownDocument.fromBody(text, {
      implicitFrontmatter: true,
    })
  }

  return { markdown, data }
}
export class TaskFolderDirectory {
  data
  markdown

  static async fromDir(dir: string) {
    let res = await parseFolder(dir)
    let obj = new TaskFolderDirectory()
    obj.markdown = res.markdown
    obj.data = res.data
    return obj
  }
}
