/** @deprecated Use polyfill to encourage standard usage */
export function groupBy<T, K extends string>(
  list: T[],
  keyGetter: (x: T) => K,
): {
  [key in K]: T[]
} {
  // Map<K, T>
  const map = new Map()
  list.forEach(item => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  let obj = Object.fromEntries(map)
  return obj
}
