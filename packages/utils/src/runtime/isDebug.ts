// TODO:utils-dedup
export function isDebug(key?: string) {
  if (!global.process) return false
  if (!key) {
    return process.env.DEBUG === '1'
  }
  return process.env.DEBUG?.includes(key)
}
