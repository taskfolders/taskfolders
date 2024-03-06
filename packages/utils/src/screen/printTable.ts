import { visualLength, padEnd } from '../native/string/index.js'
import { MemoryScreenPrinter } from './MemoryScreenPrinter.js'

export const printTable = (kv: {
  rows: string[][]
  screen?: MemoryScreenPrinter
  headers?: string[]
}) => {
  let padding = 2
  let maxLength: number[]
  let screen = kv.screen ?? new MemoryScreenPrinter()

  if (kv.headers) {
    maxLength = kv.headers.map(x => x.length + padding)
  } else {
    maxLength = Array.from<number>({
      length: kv.rows[0].length + padding,
    }).fill(1)
  }

  for (let row of kv.rows) {
    for (let [index, value] of row.entries()) {
      let len = visualLength(value) + padding
      maxLength[index] = Math.max(maxLength[index], len)
    }
  }

  if (kv.headers) {
    let headLine = kv.headers
      .map((x, idx) => padEnd(x, maxLength[idx]))
      .join('')
    screen.log(headLine).log('-'.repeat(headLine.length))
  }

  for (let row of kv.rows) {
    let parts = row.map((x, idx) => padEnd(x, maxLength[idx]))

    // kv.screen.log([repo, commits, push].join(''))
    screen.log(parts.join(''))
  }
  return screen
}
