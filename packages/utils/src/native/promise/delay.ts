import { interval } from 'rxjs'
// import { parseDuration } from '../date/duration/parseDuration'
import { map, take } from 'rxjs/operators'
import { $dev } from '../../logger/index.js'

export function delay(thing: number | string, kv: { debug? } = {}) {
  let id
  let ms = typeof thing === 'number' ? thing : parseDuration(thing)

  if (kv.debug && ms > 2000) {
    interval(1000)
      .pipe(
        map(x => {
          return x
        }),
        take(ms / 1000),
      )
      .subscribe(x => {
        $dev(`${x}/${ms / 1000}`)
      })
  }

  let prom = new Promise(function delayTimer(resolve, reject) {
    id = setTimeout(resolve, ms)
  })

  // prom.cancel = () => {
  //   deprecate('No promise cancel!')
  //   clearTimeout(id)
  // }
  return prom
}
function parseDuration(thing: string): number {
  throw new Error('Function not implemented.')
}
