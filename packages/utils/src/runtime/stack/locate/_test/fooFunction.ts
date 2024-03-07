import {
  getCallerFile,
  getCallStack,
  getCallerFile_v1,
  toClearStackFrame,
} from '../getCallerFile.js'

export function foo() {
  return { callerFile: getCallerFile_v1(), stack: getCallStack() }
}

export function debugMe() {
  let r1 = getCallStack().map(toClearStackFrame)
  console.log(r1.slice(0, 3))
  console.log(import.meta.url)
}

export function useVersion2(kv: Partial<Parameters<typeof getCallerFile>[0]>) {
  return getCallerFile({ ...kv, afterFile: import.meta.url })
}
