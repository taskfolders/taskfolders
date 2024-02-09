export function progressBar(
  kv: ({ percent: number } | { interval: number[] } | { count; total }) & {
    barLength?: number
  },
) {
  let percent
  if ('percent' in kv) {
    percent = kv.percent
  } else if ('interval' in kv) {
    percent = kv.interval[0] / kv.interval[1]
  } else if ('total' in kv) {
    percent = kv.count / kv.total
  } else {
    throw Error('Invalid params')
  }

  const barLength = kv.barLength ?? 20
  const progress = Math.round(barLength * percent)

  const progressBar =
    '[' +
    '='.repeat(progress + 1) +
    // '>'.repeat(1) +
    '.'.repeat(barLength - progress - 1) +
    ']'

  return progressBar
  // console.clear()
  // console.log('Progress:', progressBar)
}
