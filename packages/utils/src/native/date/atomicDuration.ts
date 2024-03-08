import { intervalToDuration } from 'date-fns/intervalToDuration'

// Parameters<typeof atomicDuration>[1]
export type AtomicDurationOptions = {
  start?: Date
  atoms?: number
  padding?
  padChar?: string
  paddingFull?: boolean
}

export const atomicDuration = (end: Date, kv: AtomicDurationOptions = {}) => {
  let start = kv.start ?? new Date()
  end ??= new Date()
  const code = {
    years: 'Y',
    months: 'M', // uppercase avoids mixing with 'm - minutes'
    weeks: 'w',
    days: 'd',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
  }

  if (start > end) {
    let tmp = start
    start = end
    end = tmp
  }

  let d2 = intervalToDuration({ start, end })
  let weeks = Math.floor(d2.days / 7)
  let days = d2.days % 7
  let duration = { ...d2, weeks, days }
  // delete duration.seconds
  // delete duration.minutes
  // delete duration.hours

  let pick = key => [key, duration[key]]

  let all = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']
    .map(pick)
    .filter(x => x[1] > 0)
    .map(([key, value]) => {
      let str = value.toString()
      if (kv.padding) {
        let padChar = kv.padChar ?? '0'
        str = str.padStart(2, padChar)
      }
      return [code[key], str]
    })

  // TODO too hacky
  if (all.length === 0) {
    let ms = (end.getTime() - start.getTime()) % 1_000
    return `${ms}ms`
  }

  let parts = all.map(([key, value]) => {
    return value + key
  })

  let atoms = kv.atoms ?? 2
  parts = parts.slice(0, atoms)

  let paddingFull = kv.paddingFull ?? false
  if (paddingFull) {
    let missing = atoms - parts.length
    while (missing > 0) {
      missing--
      parts = ['   ', ...parts]
    }
  }

  return parts.join(' ')
}
