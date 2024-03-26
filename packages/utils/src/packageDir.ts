import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

export function packageDir(...x: string[]) {
  return join(__dirname, '../..', ...x)
}
