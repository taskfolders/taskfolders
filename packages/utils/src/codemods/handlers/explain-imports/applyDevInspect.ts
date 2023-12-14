import { inspect } from 'node:util'

export const applyDevInspect = (final: Object) => {
  function hasUserPrototype(obj) {
    return Object.getPrototypeOf(obj) !== Object.prototype
  }
  let target = final
  if (hasUserPrototype(target)) {
    target = Object.getPrototypeOf(final)
  } else {
    target = final
  }
  target[Symbol.for('nodejs.util.inspect.custom')] = function () {
    let copy = {}
    Object.keys(this).map(x => {
      let value = this[x]
      let txt: string
      if (typeof value === 'string') {
        txt = value
      } else {
        txt = inspect(value)
      }
      if (txt.length > 500) {
        txt = `.. (${txt.length})`
        copy[x] = txt
      } else {
        copy[x] = value
      }
    })
    return copy
  }
}
