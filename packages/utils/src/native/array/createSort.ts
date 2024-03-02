export type SortDirection = 'ascending' | 'descending'

const compareString = (left: string, right: string) =>
  left.localeCompare(right, 'en', { sensitivity: 'base' })
const compareNumbers = (lhs: number, rhs: number) => lhs - rhs
const compareDates = (lhs: Date, rhs: Date) => lhs.getTime() - rhs.getTime()

const compareThing = (kv: {
  left: unknown
  right: unknown
  direction?: SortDirection
  compare?
}): number => {
  let direction = kv.direction ?? 'ascending'
  let { left, right } = kv

  let compare = kv.compare
  if (!compare) {
    if (typeof left === 'string') {
      compare = compareString
    } else if (typeof left === 'number') {
      compare = compareNumbers
    } else if ((left as any) instanceof Date) {
      compare = compareDates
    } else {
      throw Error(`Unknown sort/compare case for ${left}`)
    }
  }

  let res = compare(left, right)
  if (direction === 'ascending') return res
  return res * -1
}

const sortArray = (
  kv: { direction?: SortDirection; compare?<T = any>(lhs, rhs) } = {},
) => {
  return (left: unknown, right: unknown): number => {
    return compareThing({ left, right, ...kv })
  }
}

const sortByGetter =
  <TKey extends string>(
    getter: (x) => any,
    kv: { direction?: SortDirection; compare?<T = any>(lhs, rhs) } = {},
  ) =>
  <T extends Record<TKey, any>>(lhs: T, rhs: T): number => {
    let left = getter(lhs)
    let right = getter(rhs)
    return compareThing({ left, right, ...kv })
  }

const sortByKey =
  <TKey extends string>(
    key: TKey,
    kv: { direction?: SortDirection; compare?<T = any>(lhs, rhs) } = {},
  ) =>
  <T extends Record<TKey, any>>(lhs: T, rhs: T): number => {
    let left = lhs[key]
    let right = rhs[key]
    return compareThing({ left, right, ...kv })
  }

interface SortOptions {
  direction?: SortDirection
}

export function createSort<T extends string | number | Date>(
  kv?: SortOptions,
): (lhs: T, rhs: T) => number

export function createSort(
  kv: { key: string } & SortOptions,
): ReturnType<typeof sortByKey>

export function createSort<T>(
  kv: { getter: (x: T) => any } & SortOptions,
): (lhs: T, rhs: T) => number

export function createSort(thing) {
  thing ??= {}
  let direction = thing?.direction ?? 'ascending'
  if ('key' in thing) {
    return sortByKey(thing.key, { direction })
  } else if ('getter' in thing) {
    return sortByGetter(thing.getter, { direction })
  } else {
    return sortArray({ direction })
  }
}
