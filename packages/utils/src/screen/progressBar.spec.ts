import { progressBar } from './progressBar'

describe('x', () => {
  it('x', async () => {
    $dev(progressBar({ percent: 20 / 100 }))
    $dev(progressBar({ total: 100, count: 30 }))
    $dev(progressBar({ total: 100, count: 30, barLength: 30 }))
  })
})
