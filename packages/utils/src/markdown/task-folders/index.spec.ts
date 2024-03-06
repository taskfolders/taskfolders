import dedent from 'dedent'
import { expect, describe, it } from 'vitest'
import { toMarkdowns } from './toMarkdowns.js'
import { TaskFoldersFrontmatterWriteModel } from './TaskFoldersFrontmatterWriteModel.js'

function forwardProxy(kv: { first; alternative }) {
  return new Proxy(kv.first, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else {
        return Reflect.get(kv.alternative, prop, receiver)
      }
    },
  })
}

class TaskFoldersFrontmatterViewModel {
  _write: TaskFoldersFrontmatterWriteModel

  static fromWriteModel(model: TaskFoldersFrontmatterWriteModel) {
    let obj = new this()
    obj._write = model

    return obj
  }

  get tags() {
    return this._write
  }
}
it('x', async () => {
  let body = dedent`
    title: one
  `
  let res = await toMarkdowns(body, { coerce: true })
  $dev(res)
  // console.dir(res)
})
