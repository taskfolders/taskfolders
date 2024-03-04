import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatter } from './TaskFoldersFrontmatter.js'

export class TaskFoldersMarkdownDocument extends MarkdownDocument<TaskFoldersFrontmatter> {
  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
  ): Promise<InstanceType<T>> {
    let next = await super.fromBody(body)
    next.data = TaskFoldersFrontmatter.fromJSON(next.data)
    return next as any //TaskFoldersMarkdownDocument
  }

  static async fromMarkdownMaybe(
    md: MarkdownDocument,
  ): Promise<TaskFoldersMarkdownDocument> {
    //
    let obj = md.clone()
    throw Error('todo')
    return obj as any
  }

  static async fromBodyMaybe(str): Promise<TaskFoldersMarkdownDocument> {
    let next = await super.fromBody(str)
    return next as TaskFoldersMarkdownDocument
  }
}
