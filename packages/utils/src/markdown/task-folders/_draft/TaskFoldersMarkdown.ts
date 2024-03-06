import { MarkdownDocument } from '../../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from '../TaskFoldersFrontmatterWriteModel.js'

export class TaskFoldersMarkdown extends MarkdownDocument<TaskFoldersFrontmatterWriteModel> {
  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
  ): Promise<InstanceType<T>> {
    let next = await super.fromBody(body)
    next.data = await TaskFoldersFrontmatterWriteModel.fromJSON(next.data)
    return next as any //TaskFoldersMarkdownDocument
  }

  static async fromMarkdownMaybe(
    md: MarkdownDocument,
  ): Promise<TaskFoldersMarkdown | null> {
    //
    let obj = md.clone()
    throw Error('todo')
    return obj as any
  }

  static async fromBodyMaybe(str): Promise<TaskFoldersMarkdown> {
    let next = await super.fromBody(str)
    try {
      next.data = await TaskFoldersFrontmatterWriteModel.fromJSON(next.data)
    } catch (e) {
      return null
    }
    return next as TaskFoldersMarkdown
  }
}
