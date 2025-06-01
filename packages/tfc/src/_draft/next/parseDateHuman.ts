import { parse, isValid } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import * as TZ from 'date-fns-tz'

export const parseDateHuman = (text: string) => {
  let date = parse(text, 'MMM d, yyyy', new Date())
  if (isValid(date)) {
    let utc = TZ.fromZonedTime(date, 'UTC')
    // const utc = toZonedTime(date, 'UTC')
    return utc
  }

  date = parse(text, 'yyyy-MM-dd', new Date())
  if (isValid(date)) {
    let utc = TZ.fromZonedTime(date, 'UTC')
    // const utc = toZonedTime(date, 'UTC')
    return utc
  }
}
