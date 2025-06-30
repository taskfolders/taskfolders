// TODO #review #utils #refactor
export function isBlank(value: any): boolean {
  if (value === undefined) return true
  if (value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true

  function isPlainObjectEmpty(obj) {
    return obj && obj.constructor === Object && Object.keys(obj).length === 0
  }

  if (isPlainObjectEmpty(value)) {
    return true
  }
  return false
}
