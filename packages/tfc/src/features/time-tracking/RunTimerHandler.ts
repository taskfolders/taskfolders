import notifier from 'node-notifier'
// play-sound.js
import player from 'sound-play'

// sound.play('/tmp/alarm-end.mp3', err => {
//   if (err) console.error('Error playing sound:', err)
// })
const soundFile = '/tmp/alarm-end.mp3'
// audio.kill()

// play-sound.js
import { exec } from 'node:child_process'
function playSound(filePath) {
  return new Promise((resolve, reject) => {
    exec(`paplay "${filePath}"`, err => {
      if (err) {
        reject(err)
      } else {
        resolve(null)
      }
    })
  })
}

// countdown.js
const countdown = async seconds => {
  let remaining = seconds

  return new Promise(resolve => {
    const interval = setInterval(() => {
      const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
      const seconds = String(remaining % 60).padStart(2, '0')

      process.stdout.write(`\rTime left: ${minutes}:${seconds}   `)

      remaining--

      if (remaining < 0) {
        clearInterval(interval)
        process.stdout.write("\rTime's up!           \n")
        stop()
      }
    }, 1000)

    const stop = async () => {
      clearInterval(interval)
      await playSound(soundFile).then(() => {
        console.log('Sound played')
      })
      resolve(null)
    }

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      process.stdout.write('\nCountdown cancelled.\n')
      stop()
    })
  })
}

// Example: 10-second countdown

export class RunTimerHandler {
  constructor(public params) {}
  async execute() {
    console.log('RunTimerHandler.execute called')
    await countdown(5)
    //await countdown(60 * 25)
    notifier.notify({
      title: 'Countdown Finished',
      message: 'Your timer has ended!',
      sound: true, // May not work in all GNOME setups
    })

    console.log('Timer end')
  }
}
