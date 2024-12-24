import { MarkdownDocument } from '../MarkdownDocument.js'
import { TaskFoldersFrontmatterWriteModel } from './model/WriteModel.js'
import { TaskFoldersFrontmatterReadModel } from './model/ReadModel.js'
import * as FS from 'node:fs'

export interface MarkdownParsed {
  plain: MarkdownDocument<any>
  taskfolder?: TaskFoldersMarkdown
}

const mdTypes = [
  'https://taskfolders.com/docs/markdown/v1',
  'https://taskfolders.com/docs/markdown',
  'taskfolders.com/docs/markdown',
  'taskfolders.com/types/markdown',
  'https://taskfolders.com/types/markdown',

  TaskFoldersFrontmatterWriteModel.type,
]

export class TaskFoldersMarkdown extends MarkdownDocument<TaskFoldersFrontmatterReadModel> {
  static from(
    kv: ({ text?: string } | { file?: string }) & {
      coerce?: boolean
      fs?: typeof FS
    },
  ) {
    let body: string
    if ('text' in kv) {
      body = kv.text
    } else if ('file' in kv) {
      let fs = kv.fs ?? FS
      body = fs.readFileSync(kv.file).toString()
    } else {
      throw Error('invalid params')
    }

    return TaskFoldersMarkdown.parse(body)
  }

  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
    kv = {},
  ): Promise<InstanceType<T>> {
    let next = await super.fromBody(body)
    let writeModel = TaskFoldersFrontmatterWriteModel.fromJSON(next.data)
    let readModel = TaskFoldersFrontmatterReadModel.fromWriteModel(writeModel)
    next.data = readModel
    return next as any //TaskFoldersMarkdownDocument
  }

  static async parse(
    body: string,
    kv?: { coerce: boolean },
  ): Promise<MarkdownParsed> {
    let md = await MarkdownDocument.fromBody<any>(body, {
      implicitFrontmatter: true,
    })
    let taskfolder: TaskFoldersMarkdown
    try {
      let copy = { ...md.data }

      let hasMdType = md.data?.type && mdTypes.includes(md.data.type)
      let canCoerce = kv?.coerce && !md.data?.type

      if (hasMdType || canCoerce) {
        if (kv?.coerce) {
          copy.type ??= TaskFoldersFrontmatterWriteModel.type
        }

        let write = TaskFoldersFrontmatterWriteModel.fromJSON(copy)
        let read = TaskFoldersFrontmatterReadModel.fromWriteModel(write)
        md.setData(read)
        taskfolder = new TaskFoldersMarkdown(read, body)
      }
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

  isWorkspace() {
    return this.data.flags?.includes('workspace')
  }
}
