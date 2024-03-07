/* TODO get file tree call?
 *
 * Look at this example:
 *   https://github.com/sindresorhus/caller-callsite/blob/main/index.js
 *
 * we want a 'unique' list of file calls
 */

// TODO:dedup-code-pos 3201f400-3e98-4a42-a943-5cc63a4a6af1
export class SourcePosition {
  path: string
  fileBuild: string
  lineNumber?: number
  columnNumber: number
  context: string
  stackIndex: number
  stack: any[] = []

  constructor(kv: { path: string; lineNumber?: number }) {
    this.path = kv.path
    this.lineNumber = kv.lineNumber
    Object.defineProperty(this, 'stack', { enumerable: false })
  }

  tmp() {
    let all = this.stack
      .map(x => {
        return {
          file: x.getFileName(),
          type: x.getTypeName(),

          // try functionName first because it might have class name
          //   method: 'run',
          //   function: 'Runnable.run'
          context: x.getFunctionName() ?? x.getMethodName(),
        }
      })
      .map(x => {
        if (x.file.includes('/node_modules/')) return null
        if (x.type === 'process') return null
        return x
      })
    return all
  }
}
