import { setTabTitle } from '@taskfolders/utils/shell'

export class TabSpinner {
  isRunning = false
  timer?: Timer
  async spin(kv?: { suffix?: string; atEnd?: () => void }) {
    if (this.isRunning) {
      return
    }
    let chain = ['|', '/', '-', '|', '/', '-']
    if (kv?.suffix) {
      chain = chain.map(x => [x, kv.suffix].join(' '))
    }
    let idx = 0
    this.isRunning = true

    return new Promise(resolve => {
      let tick = () => {
        let txt = chain[idx]

        setTabTitle(txt)
        idx++
        if (idx === chain.length) {
          this.isRunning = false
          kv?.atEnd?.()
          resolve(null)
        } else {
          this.timer = setTimeout(() => {
            tick()
          }, 100)
        }
      }

      tick()
    })
  }

  stop() {
    clearTimeout(this.timer)
  }
}
