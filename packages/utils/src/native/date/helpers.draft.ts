import { format, setISOWeek } from 'date-fns'

const week_s = "yyyy-'W'II"
const toWeekISO = (x: Date) => format(x, week_s)
export const weekISO = {
  format: toWeekISO,
  test(x: string) {
    return !!x?.match(/\d{4,}-W\d{2}/)
  },
  parse: (x: string, kv: { now?: Date } = {}) => {
    let [year, week] = x.split('-')
    let week_i = parseInt(week.slice(1))
    let date = new Date(year)
    date = setISOWeek(date, week_i)
    return date
    // return parse(x, "yy-'W'II", kv.now ?? new Date())
  },
}

export const toMonth = (x: Date) => format(x, 'yyyy-MMMM')
export const toJustDateISO = (x: Date) => format(x, 'yyyy-MM-dd')

export const isValidDate = (x: Date) => x instanceof Date && !isNaN(x.valueOf())

export const parseFuzzyDate = (x: string): Date => {
  if (weekISO.test(x)) return weekISO.parse(x)
  let res = new Date(x)
  if (!isValidDate(res)) {
    return undefined
  }
  return res
}
