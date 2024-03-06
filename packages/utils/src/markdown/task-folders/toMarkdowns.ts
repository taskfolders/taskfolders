import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from './TaskFoldersFrontmatterWriteModel.js'

export async function toMarkdowns(body: string, kv: { coerce? } = {}) {
  let md = await MarkdownDocument.fromBody<any>(body, {
    implicitFrontmatter: true,
  })
  let standard: MarkdownDocument<TaskFoldersFrontmatterWriteModel>
  try {
    let copy = { ...md.data }
    if (kv.coerce) {
      copy.type ??= TaskFoldersFrontmatterWriteModel.type
    }
    let data = TaskFoldersFrontmatterWriteModel.fromJSON(copy)
    md.setData(data)
    standard = md
  } catch (e) {
    //
  }
  return { markdown: md, standard }
}
