import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterViewModel } from './model/TaskFoldersFrontmatterViewModel.js'
import { TaskFoldersFrontmatterWriteModel } from './model/TaskFoldersFrontmatterWriteModel.js'

export async function toMarkdowns(body: string, kv: { coerce? } = {}) {
  let md = await MarkdownDocument.fromBody<any>(body, {
    implicitFrontmatter: true,
  })
  let taskFolder: MarkdownDocument<TaskFoldersFrontmatterViewModel>
  try {
    let copy = { ...md.data }
    if (kv.coerce) {
      copy.type ??= TaskFoldersFrontmatterWriteModel.type
    }
    let model = TaskFoldersFrontmatterWriteModel.fromJSON(copy)
    let view = TaskFoldersFrontmatterViewModel.fromWriteModel(model)
    md.setData(view)
    taskFolder = md
  } catch (e) {
    //
  }
  return { plain: md, taskFolder }
}

export async function toTaskFoldersMarkdown(
  body: string,
  kv: { coerce? } = {},
) {
  let res = await toMarkdowns(body, kv)
  if (!res.taskFolder) {
    throw Error('Non TaskFolders markdown')
  }
  return res.taskFolder
}
