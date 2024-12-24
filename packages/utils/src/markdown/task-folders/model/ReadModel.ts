import {
  TaskFoldersFrontmatterWriteModel as WriteModel,
  ScriptDef,
} from './WriteModel.js'
import { forwardProxy } from '../forwardProxy.js'
import { CalendarEvent } from './CalendarEvent.js'
import { ensureWords } from './ensureWords.js'

export class TaskFoldersFrontmatterReadModel {
  _writeModel: WriteModel
  private _cache
  readonly uid: string
  readonly sid: string
  readonly title: string
  readonly type: string
  readonly workspace: string

  static fromWriteModel(model: WriteModel): TaskFoldersFrontmatterReadModel {
    let obj = new this()
    obj._writeModel = model

    return forwardProxy({ first: obj, alternative: model })
  }

  get tags() {
    return ensureWords(this._writeModel.tags ?? []) // ?? []
  }

  get flags() {
    return ensureWords(this._writeModel.flags ?? []) // ?? []
  }

  get labels() {
    return ensureWords(this._writeModel.labels ?? []) // ?? []
  }

  get calendar() {
    let all = this._writeModel.calendar ?? []
    return all.map(x => CalendarEvent.fromJSON(x))
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
