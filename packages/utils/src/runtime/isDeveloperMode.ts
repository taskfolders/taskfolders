import { isReleaseMode } from './isReleaseMode.js'
export function isDeveloperMode() {
  if (isReleaseMode()) return false
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.TF_DEV === '1' ||
    process.env.DEV === '1'
  )
}
