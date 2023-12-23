export function randomId(size = 6) {
  // const baseX = require('base-x');
  // const base62 = baseX('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

  let rand = Math.random()
    // 0-9 and a-z
    // Using base 62  will add uppercase letters, but a radix greater than 36 requires extra dependencies
    .toString(36)
    .slice(2, 2 + size)
  return rand
}
