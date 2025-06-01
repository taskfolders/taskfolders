import { parse, isValid } from 'date-fns'

export const parseDateHuman = (text: string) => {
  let date = parse(text, 'MMM d, yyyy', new Date())
  if (isValid(date)) return date

  date = parse(text, 'yyyy-MM-dd', new Date())
  if (isValid(date)) return date
}
