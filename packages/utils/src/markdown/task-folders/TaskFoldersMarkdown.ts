import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from './model/TaskFoldersFrontmatterWriteModel.js'
import { TaskFoldersFrontmatterReadModel } from './model/TaskFoldersFrontmatterReadModel.js'

export class TaskFoldersMarkdown extends MarkdownDocument<TaskFoldersFrontmatterReadModel> {
  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
    kv = {},
  ): Promise<InstanceType<T>> {
    let next = await super.fromBody(body)
    let model = TaskFoldersFrontmatterWriteModel.fromJSON(next.data)
    let view = TaskFoldersFrontmatterReadModel.fromWriteModel(model)
    next.data = view
    return next as any //TaskFoldersMarkdownDocument
  }

  static async parse(
    body: string,
    kv?: { coerce: boolean },
  ): Promise<{
    plain: MarkdownDocument<any>
    taskfolder?: TaskFoldersMarkdown
  }> {
    let md = await MarkdownDocument.fromBody<any>(body, {
      implicitFrontmatter: true,
    })
    let taskfolder: MarkdownDocument<TaskFoldersFrontmatterReadModel>
    try {
      let copy = { ...md.data }
      if (kv?.coerce) {
        copy.type ??= TaskFoldersFrontmatterWriteModel.type
      }
      let model = TaskFoldersFrontmatterWriteModel.fromJSON(copy)
      let view = TaskFoldersFrontmatterReadModel.fromWriteModel(model)
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

  static async fromBodyMaybe(
    str: string,
    kv?: { coerce: boolean },
  ): Promise<TaskFoldersMarkdown> {
    let next = await super.fromBody(str, { implicitFrontmatter: true })
    try {
      let data = next.data as any
      if (kv?.coerce) {
        data ??= {}
        data.type ??= TaskFoldersFrontmatterWriteModel.type
      }
      next.data = await TaskFoldersFrontmatterWriteModel.fromJSON(data)
    } catch (e) {
      return null
    }
    return next as TaskFoldersMarkdown
  }
}
