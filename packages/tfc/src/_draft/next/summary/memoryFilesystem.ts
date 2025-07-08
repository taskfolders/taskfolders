import fs from 'fs'
import { memfs } from 'memfs'

export const memoryFilesystem = x => memfs(x).fs as any as typeof fs
