// import { parseDuration } from '../date/duration/parseDuration'

export function delay(ms: number, kv: { debug? } = {}) {
  let id

  let prom = new Promise(function delayTimer(resolve, reject) {
    id = setTimeout(resolve, ms)
  })

  return prom
}
