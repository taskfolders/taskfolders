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
  } else if (kv.afterFileName) {
    let all = stack.map(x => {
      return {
        fileName: x.getFileName(),
        str: x.toString(),
        lineNumber: x.getLineNumber(),
      }
    })
    let idx = all.findIndex(x => x.fileName === kv.afterFileName)
    let pos = all[idx + 1]
    return { path: pos.fileName, lineNumber: pos.lineNumber }
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
