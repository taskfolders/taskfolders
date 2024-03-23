import { spawn } from 'child_process'

export function encryptGPGMessage(kv: {
  recipients: string[]
  message: string | Buffer
  armor?: boolean
}): Promise<{ buffer: Buffer; type: 'binary' | 'armor' }> {
  const recipients = kv.recipients.map(x => ['--recipient', x]).flat()
  const inputText = 'Hello, world!' // insert input text here

  let options = ['--encrypt', ...recipients]
  if (kv.armor) options.push('--armor')

  const gpg = spawn('gpg', options)

  gpg.stdin.write(inputText)
  gpg.stdin.end()

  let stdoutBuffer = Buffer.alloc(0)

  gpg.stdout.on('data', data => {
    // console.log(data.toString())
    stdoutBuffer = Buffer.concat([stdoutBuffer, data])
  })

  gpg.stderr.on('data', data => {
    // $dev({ data: data.toString() })
  })
  gpg.on('error', () => {
    //
  })

  return new Promise((resolve, reject) => {
    gpg.on('exit', code => {
      if (code === 0) {
        resolve({ buffer: stdoutBuffer, type: 'binary' })
      } else {
        let e = new Error('Encryption failed')
        e.data = { exitCode: code }
        reject(e)
      }
    })
  })
}
