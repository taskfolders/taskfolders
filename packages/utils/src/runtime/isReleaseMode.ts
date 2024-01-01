export function isReleaseMode() {
  if (global.process?.env?.APP_RELEASE) return true
  return false
}
