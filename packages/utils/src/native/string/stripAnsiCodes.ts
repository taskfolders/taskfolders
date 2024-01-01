// TODO:utils-dedup

import ansiRegex from 'ansi-regex'

export const stripAnsiCodes = string =>
  typeof string === 'string' ? string.replace(ansiRegex(), '') : string

