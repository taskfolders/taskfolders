import {
  TaskFoldersFrontmatterWriteModel as WriteModel,
  ScriptDef,
} from './TaskFoldersFrontmatterWriteModel.js'
import { forwardProxy } from '../forwardProxy.js'

function ensureWords(thing: string | string[]): string[] {
  let words = typeof thing === 'string' ? thing.split(',') : thing
  return words.map(x => x.trim())
}

export class TaskFoldersFrontmatterViewModel {
  _writeModel: WriteModel
  private _cache
  readonly uid: string
  readonly sid: string
  readonly title: string
  readonly type: string

  static fromWriteModel(model: WriteModel): TaskFoldersFrontmatterViewModel {
    let obj = new this()
    obj._writeModel = model

    return forwardProxy({ first: obj, alternative: model })
  }

  get tags() {
    return ensureWords(this._writeModel.tags ?? []) // ?? []
  }

  setValue<K extends keyof WriteModel>(key: K, value) {
    this._writeModel[key] = value
    delete this._cache
  }

  get scripts(): Record<string, ScriptDef> {
    let target = {} as Record<string, ScriptDef>
    let doc = this._writeModel.scripts ?? {}
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
    if (this._writeModel.exclude === true) return ['.']
    return this._writeModel.exclude ?? []
  }

  toJSON() {
    return this._writeModel.toJSON()
  }
}
