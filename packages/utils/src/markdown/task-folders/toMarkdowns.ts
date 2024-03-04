import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'

export async function toMarkdowns(body: string, kv: { coerce? } = {}) {
  let md = await MarkdownDocument.fromBody<any>(body, {
    implicitFrontmatter: true,
  })
  let standard: MarkdownDocument<TaskFoldersFrontmatter>
  try {
    let copy = { ...md.data }
    if (kv.coerce) {
      copy.type ??= TaskFoldersFrontmatter.type
    }
    let data = TaskFoldersFrontmatter.fromJSON(copy)
    md.setData(data)
    standard = md
  } catch (e) {
    //
  }
  return { markdown: md, standard }
}
