import { stripAnsiCodes } from './stripAnsiCodes'

export const padEnd = (txt: string, n: number) => {
  let clean = stripAnsiCodes(txt)
  let next = clean.padEnd(n)
  let pad_tail = next.match(/ +$/)
  if (!pad_tail) {
    return txt
  }
  let pad_s = pad_tail[0]
  return txt + pad_s
  // return txt.replace(clean, next)
}
