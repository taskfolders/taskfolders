import {
  getCallerFile_v2,
  getCallStack,
  getCallerFile,
  toClearStackFrame,
} from '../getCallerFile.js'

export function foo() {
  return { callerFile: getCallerFile(), stack: getCallStack() }
}

export function debugMe() {
  let r1 = getCallStack().map(toClearStackFrame)
  console.log(r1.slice(0, 3))
  console.log(import.meta.url)
}

export function useVersion2(
  kv: Partial<Parameters<typeof getCallerFile_v2>[0]>,
) {
  return getCallerFile_v2({ ...kv, afterFile: import.meta.url })
}
