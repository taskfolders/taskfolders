import { getCallStack, getCallerFile } from '../getCallerFile'

export function foo() {
  return { callerFile: getCallerFile(), stack: getCallStack() }
}
