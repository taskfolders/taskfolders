export function setTabTitle(title: string) {
  // let cmd = '\033]0;${title}\007'
  let cmd = `\x1b]0;${title}\x07`
  process.stdout.write(cmd)
  // process.stdout.write(code)
  return this
}

export function clearConsoleAndScrollBuffer() {
  // if (!CanClearScreen.isEnabled()) return
  process.stdout.write('\u001b[3J\u001b[1J')
  console.clear() /* eslint-disable-line */
}
