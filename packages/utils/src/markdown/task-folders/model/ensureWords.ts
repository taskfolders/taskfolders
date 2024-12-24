export function ensureWords(thing: string | string[]): string[] {
  if (!thing) return []
  let words = typeof thing === 'string' ? thing.split(',') : thing
  return words.map(x => x.trim())
}
