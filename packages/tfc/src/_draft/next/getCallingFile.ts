export function getCallingFile(
  __filename: string,
  kv: { debug?; afterFileName? } = {},
) {
  const origPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const err = new Error()
  const stack = err.stack as unknown as NodeJS.CallSite[]
  Error.prepareStackTrace = origPrepareStackTrace

  if (kv.debug) {
    let all = stack.map(x => {
      return { fileName: x.getFileName(), str: x.toString() }
    })
    console.log({ all })
  }
  if (kv.afterFileName) {
    let idx = stack.findIndex(x => x.getFileName() === kv.afterFileName)

    // keep looking for first different file
    // - same file can appear multiple times
    while (stack[idx].getFileName() == kv.afterFileName) {
      idx++
    }
    let pos = stack[idx]
    let res = { path: pos.getFileName(), lineNumber: pos.getLineNumber() }
    return res
  }

  // Find the first callsite outside this file
  for (let i = 0; i < stack.length; i++) {
    const fileName = stack[i].getFileName()
    if (fileName && fileName !== __filename) {
      return { path: fileName, lineNumber: stack[i].getLineNumber() }
    }
  }
  return undefined
}
