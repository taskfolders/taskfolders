import { getCallStack, getCallerFile } from '../getCallerFile.js'

export function foo() {
  return { callerFile: getCallerFile(), stack: getCallStack() }
}
