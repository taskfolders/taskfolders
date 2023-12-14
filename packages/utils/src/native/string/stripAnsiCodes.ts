// TODO:utils-dedup
import ansiRegex from 'ansi-regex'

// TODO:dedup/easy

export const stripAnsiCodes = string =>
  typeof string === 'string' ? string.replace(ansiRegex(), '') : string

export const stripLinks = (txt: string) =>
  // eslint-disable-next-line no-control-regex
  txt.replace(/\x1B\]8;;(.*)\x07(.*)\x1B\]8;;\x07/g, (...x) => {
    let [_, link, text] = x
    // return `--${text}--`
    return `<a class='link' href='${link}'>${text}</a>`
    // return text
  })
