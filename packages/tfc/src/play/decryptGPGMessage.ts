import { spawn } from 'child_process'

export const decryptGPGMessage = async (
  encryptedMessage: string | Buffer,
): Promise<{ message: string; keys: { alg; keyHex; keyTitle }[] }> => {
  const gpgProcess = spawn('gpg', ['--decrypt'], {
    // stdio: ['pipe', 'pipe', 'inherit'],
    // encoding: 'utf-8',
  })
  // Pass the GPG-encrypted message to the GPG process
  gpgProcess.stdin.write(encryptedMessage)
  gpgProcess.stdin.end()

  let decryptedMessage = ''

  // Handle GPG process output
  gpgProcess.stdout.on('data', data => {
    decryptedMessage += data
  })

  // Handle GPG process errors
  let keys = []
  gpgProcess.stderr.on('data', data => {
    let msg = data.toString()
    let ma = msg.match(
      // /(?<type>\w+) key, ID (?<keyName>\w+).*"(?<keyName>\w+)"/,
      /(?<alg>\w+) key, ID (?<keyHex>\w+).*\n.*"(?<keyTitle>.*)"/m,
    )
    if (ma) {
      keys.push(ma.groups)
    }
    // console.error(`Error: ${data}`)
  })

  // Wait for the GPG process to finish
  return await new Promise((resolve, reject) => {
    gpgProcess.on('close', code => {
      if (code === 0) {
        let res = { message: decryptedMessage, keys }
        resolve(res)
      } else {
        let e = new Error('Encryption problem')
        reject(e)
      }
    })
  })
}
