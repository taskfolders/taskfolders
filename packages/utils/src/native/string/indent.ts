// TODO:utils-dedup
export const indent = (str: string, length = 2) =>
  str
    .split('\n')
    .map(x => ''.padStart(length) + x)
    .join('\n')
