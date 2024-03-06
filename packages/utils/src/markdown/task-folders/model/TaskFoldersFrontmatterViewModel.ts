import {
  TaskFoldersFrontmatterWriteModel,
  ScriptDef,
} from './TaskFoldersFrontmatterWriteModel.js'
import { forwardProxy } from '../forwardProxy.js'

function ensureWords(thing: string | string[]): string[] {
  let words = typeof thing === 'string' ? thing.split(',') : thing
  return words.map(x => x.trim())
}

export class TaskFoldersFrontmatterViewModel {
  _write: TaskFoldersFrontmatterWriteModel
  _cache
  readonly title: string

  static fromWriteModel(
    model: TaskFoldersFrontmatterWriteModel,
  ): TaskFoldersFrontmatterViewModel {
    let obj = new this()
    obj._write = model

    return forwardProxy({ first: obj, alternative: model })
  }

  get tags() {
    return ensureWords(this._write.tags ?? []) // ?? []
  }

  get scripts(): Record<string, ScriptDef> {
    let target = {} as Record<string, ScriptDef>
    let doc = this._write.scripts ?? {}
    Object.entries<any>(doc).forEach(([key, value]) => {
      if (typeof value === 'string') {
        target[key] = { run: value }
      } else {
        target[key] = value
      }
    })
    return target
  }

  get exclude() {
    return this._write.exclude ?? []
  }

  toJSON() {
    return this._write.toJSON()
  }
}
