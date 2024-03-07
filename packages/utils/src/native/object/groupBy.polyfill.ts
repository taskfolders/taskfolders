// TODO #review after:2025 Drop when standard
import { groupBy } from './groupBy.js'

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
Object.groupBy ||= groupBy
