import { stripAnsiCodes } from './stripAnsiCodes'

export const visualLength = (x: string) => stripAnsiCodes(x).length
