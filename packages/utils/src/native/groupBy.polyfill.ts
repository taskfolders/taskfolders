import _groupBy from 'lodash/groupBy'

declare global {
  interface Object {
    // groupBy<T>(this: T[], iteratee: (value: T) => string): Record<string, T[]>
    groupBy<T, K extends string>(
      list: T[],
      iteratee: (value: T) => K,
    ): Record<K, T[]>
  }
}
// eslint-disable-next-line
Object.groupBy ||= _groupBy
