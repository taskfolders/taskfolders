import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from './model/TaskFoldersFrontmatterWriteModel.js'
import { TaskFoldersFrontmatterViewModel } from './model/TaskFoldersFrontmatterViewModel.js'

export class TaskFoldersMarkdown extends MarkdownDocument<TaskFoldersFrontmatterViewModel> {
  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
    kv = {},
  ): Promise<InstanceType<T>> {
    let next = await super.fromBody(body)
    let model = TaskFoldersFrontmatterWriteModel.fromJSON(next.data)
    let view = TaskFoldersFrontmatterViewModel.fromWriteModel(model)
    next.data = view
    return next as any //TaskFoldersMarkdownDocument
  }

  static async parse(
    body: string,
    kv?: { coerce: boolean },
  ): Promise<{
    plain: MarkdownDocument<any>
    taskfolder: TaskFoldersMarkdown
  }> {
    let md = await MarkdownDocument.fromBody<any>(body, {
      implicitFrontmatter: true,
    })
    let taskfolder: MarkdownDocument<TaskFoldersFrontmatterViewModel>
    try {
      let copy = { ...md.data }
      if (kv?.coerce) {
        copy.type ??= TaskFoldersFrontmatterWriteModel.type
      }
      let model = TaskFoldersFrontmatterWriteModel.fromJSON(copy)
      let view = TaskFoldersFrontmatterViewModel.fromWriteModel(model)
      md.setData(view)
      taskfolder = md
    } catch (e) {
      //
    }

    return { plain: md, taskfolder }
    //
  }

  static async fromMarkdownMaybe(
    md: MarkdownDocument,
  ): Promise<TaskFoldersMarkdown | null> {
    //
    let obj = md.clone()
    throw Error('todo')
    return obj as any
  }

  static async fromBodyMaybe(str: string): Promise<TaskFoldersMarkdown> {
    let next = await super.fromBody(str, { implicitFrontmatter: true })
    try {
      next.data = await TaskFoldersFrontmatterWriteModel.fromJSON(next.data)
    } catch (e) {
      return null
    }
    return next as TaskFoldersMarkdown
  }
}
