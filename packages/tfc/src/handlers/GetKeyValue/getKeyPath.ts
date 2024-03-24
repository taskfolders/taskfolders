export function getKeyPath(obj, path) {
  let copy = obj
  let parts = path.split('.')
  while (parts.length > 0) {
    let key = parts.shift()
    let before = copy
    copy = copy[key]
    if (!copy) return { ok: false, data: before }
  }
  return { ok: true, data: copy }
}
