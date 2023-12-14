import { default as RawDedent } from 'dedent'

let startsWithEmptyLine = (txt: string) => txt.match(/^\s*\n/)

// export { default as dedent } from 'dedent'
// export const dedent = (x: TemplateStringsArray, ...rest) => {
export const dedent = (txt: TemplateStringsArray | string, ...rest): string => {
  if (typeof txt === 'string') {
    return dedentString(txt, ...rest)
  }

  if (!startsWithEmptyLine(txt[0])) {
    let str = ''
    txt.forEach((string, i) => {
      str += string + (rest[i] || '')
    })
    return str
  }

  // NOTE In case you want to manipulate string instead just passing
  // $dev(x.raw)
  // let copy = Array.from(x) as any
  // copy.raw = x.raw
  // return RawDedent(copy, ...rest)

  return RawDedent(txt, ...rest)
}

export function dedentString(
  txt: string,
  // txt: TemplateStringsArray,
  kv: { replaceTabs?: boolean; startEmpty?: boolean } = {},
): string {
  let ops = { replaceTabs: true, startEmpty: true, ...kv }
  if (ops.startEmpty && !startsWithEmptyLine(txt)) {
    return txt
  }
  if (ops.replaceTabs) {
    txt = txt.replace(/\t/g, '  ')
  }
  let res = RawDedent(txt)
  if (ops.replaceTabs) {
    res = res.replace(/\t/g, '')
  }

  let endNewLine = txt.split('\n').at(-1).match(/^\s*$/)
  if (endNewLine) {
    res += '\n'
  }
  return res
}
