/**
 *
 * Similar:
 * https://www.npmjs.com/package/bytes
 */

import type { ValuesOf } from '../types/ValuesOf.js'

export const myUnits = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const

/** Convert bytes to human
 *
 * Defaults to printing Mebibyte (MiB, multiple of 1024) instead Megabyte(MB,
 * multiple of 1000). Why? Most operative systems report file and storage sizes in Mebibytes
 *
 * Notice OS defaults
 *   Apple   - Reports all as MB
 *   Windows - Reports all as MiB (showing MB)
 *   Linux   - Reports all as MiB and shows MiB
 *
 */
export function bytesToHuman(bytes: number, kv: { decimals?: number } = {}) {
  let si = false
  let thresh = si ? 1000 : 1024
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }
  let units = si
    ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)

  let value = bytes
    .toFixed(kv.decimals ?? 2)
    .toString()
    .replace(/\.00$/, '')
  return value + ' ' + units[u]
}

export class ByteSugar {
  bytes: number

  static fromBytes(thing: number | string) {
    let value = typeof thing === 'string' ? parseInt(thing) : thing
    let obj = new this()
    obj.bytes = value
    return obj
  }

  toHuman(kv: { decimals?: number } = {}): string {
    return bytesToHuman(this.bytes, kv)
  }

  toUnit(unit: ValuesOf<typeof myUnits>) {
    // let units = si
    //   ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    //   : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    let units = myUnits
    let limit = units.findIndex(x => x === unit)
    let thresh = 1024
    let u = -1
    let value = this.bytes
    do {
      value /= thresh
      ++u
    } while (
      Math.abs(this.bytes) >= thresh &&
      u < units.length - 1 &&
      u < limit
    )
    return value
  }

  toJSON() {
    return this.bytes
  }

  static fromJSON(doc) {
    return this.fromBytes(doc)
  }

  toString() {
    return this.toHuman()
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} ${this.toHuman()}>`
  }
}
