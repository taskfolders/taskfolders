import { differenceInDays, differenceInWeeks, getWeek, isToday } from 'date-fns'
import { NodeLogger } from '../../logger/NodeLogger.js'

export const timeDiff = (kv: { date: Date; color?: boolean; now?: Date }) => {
  let now = kv.now ?? new Date()
  let { date } = kv
  if (!date) {
    // TODO drop
    throw Error('no date')
  }
  let due = ''
  if (isToday(date)) {
    due = 'Today'
    return due
  }
  let weekDistance = differenceInWeeks(date, now)
  if (weekDistance === 0) {
    let daysDistance = differenceInDays(date, now)
    return `${daysDistance}d`
  }
  let symbol = weekDistance > 0 ? '+' : '-'
  let diff = Math.abs(weekDistance).toString()
  // .padStart(2)
  // due = `W${weekNum} ${symbol}${diff}w`
  due = `${symbol}${diff}w`
  if (kv.color !== false) {
    if (weekDistance < 0) {
      due = NodeLogger.style.red(due)
    } else if (weekDistance < 6) {
      due = NodeLogger.style.yellow(due)
    }
  }

  return due
}
