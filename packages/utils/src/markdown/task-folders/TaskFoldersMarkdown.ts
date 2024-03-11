import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from './model/TaskFoldersFrontmatterWriteModel.js'
import { TaskFoldersFrontmatterReadModel } from './model/TaskFoldersFrontmatterReadModel.js'

export interface MarkdownParsed {
  plain: MarkdownDocument<any>
  taskfolder?: TaskFoldersMarkdown
}

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
  ): Promise<MarkdownParsed> {
    let md = await MarkdownDocument.fromBody<any>(body, {
      implicitFrontmatter: true,
    })
    let taskfolder: MarkdownDocument<TaskFoldersFrontmatterReadModel>
    try {
      let copy = { ...md.data }
      if (kv?.coerce) {
        copy.type ??= TaskFoldersFrontmatterWriteModel.type
      }
      let write = TaskFoldersFrontmatterWriteModel.fromJSON(copy)
      let read = TaskFoldersFrontmatterReadModel.fromWriteModel(write)
      md.setData(read)
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

  // TODO #dry reuse .parse
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

      let write = TaskFoldersFrontmatterWriteModel.fromJSON(data)
      let read = TaskFoldersFrontmatterReadModel.fromWriteModel(write)
      next.data = read
    } catch (e) {
      return null
    }
    return next as TaskFoldersMarkdown
  }
}
