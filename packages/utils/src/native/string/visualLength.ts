import { stripAnsiCodes } from './stripAnsiCodes.js'

export const visualLength = (x: string) => stripAnsiCodes(x).length
