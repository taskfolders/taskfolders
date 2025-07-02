import { isValid } from 'date-fns'

function parseYearMonth(input) {
  const [yearStr, monthStr] = input.split('-')
  const month = new Date(`${monthStr} 1, ${yearStr}`).getMonth()
  return new Date(Date.UTC(parseInt(yearStr), month, 1))
}

function parseIsoWeek(isoWeekStr) {
  const [yearStr, weekStr] = isoWeekStr.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(weekStr, 10)

  // Jan 4 is always in the first ISO week
  const jan4 = new Date(Date.UTC(year, 0, 4)) // 👈 use UTC constructor
  const jan4Day = jan4.getUTCDay() || 7 // Sunday = 0 → 7

  // Go to the Monday of the first ISO week
  const monday = new Date(Date.UTC(year, 0, 4 - (jan4Day - 1)))

  // Add weeks
  const targetDate = new Date(monday)
  targetDate.setUTCDate(monday.getUTCDate() + (week - 1) * 7)

  return targetDate
}

export let toDate = (txt: string) => {
  txt = txt.toString().toUpperCase()
  if (/\d+-W\w+$/i.test(txt)) {
    return parseIsoWeek(txt)
  }
  if (/\d+-\d+$/.test(txt)) {
    return new Date(txt)
  }
  if (/\d+-\w+$/.test(txt)) {
    return parseYearMonth(txt)
  }
  let date = new Date(txt)
  // console.log(date.getMonth())
  // console.log(date.getUTCMonth())
  // console.log(date.getDay())
  // console.log(date.getHours())
  if (isValid(date)) return date
  if (txt.includes('W')) {
    return parseIsoWeek(txt)
  }

  date = parseYearMonth(txt)
  return date
}
