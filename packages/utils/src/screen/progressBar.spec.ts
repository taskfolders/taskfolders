import { completionBar } from './completionBar'

describe('x', () => {
  it('x', async () => {
    $dev(completionBar({ percent: 20 / 100 }))
    $dev(completionBar({ total: 100, count: 30 }))
    $dev(completionBar({ total: 100, count: 30, barLength: 30 }))
  })
})
