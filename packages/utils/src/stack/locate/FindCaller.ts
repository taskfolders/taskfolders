// TODO:utils-dedup
//

// import { tryGetSourceFile } from './tryGetSourceFile.node'
import { getCallerFile, CodePosition, FindCallerParams } from './getCallerFile'
import { isDeveloperMode } from '../../runtime/isDeveloperMode'
const tryGetSourceFile = null
export class SourcePosition {
  file: string
  lineNumber?: number
  columnNumber?: number
  frames?

  get path() {
    return this.file
  }
  get line() {
    return this.lineNumber
  }

  static build(
    // x: Pick<SourcePosition, 'file' | 'lineNumber' | 'columnNumber'>,
    x, // : ISourcePosition,
  ) {
    let obj = new this()

    // NOTE
    //   CJS uses unix path '/'
    //   EMS uses file:// path
    obj.file = x.file.replace(/^file:\/\/\//, '/')

    obj.lineNumber = x.lineNumber
    obj.columnNumber = x.columnNumber
    // obj.frames = x.frames
    return obj
  }
}

export class FindCaller {
  /* static whenDevelopment(
    kv: { skipFileCount?: number; stack?; referenceFile? } = {},
  ): SourcePosition {
    if (process.env.NODE_ENV == 'production') return null
    return this.sourceHere(kv)
  } */

  /** @deprecated use .whenDevelopment */
  static whenNotProduction(kv: FindCallerParams = {}): CodePosition | null {
    // if (process.env.NODE_ENV === 'production') return null
    // return getCallerFile({ offset: 3, ...kv })
    let env = process.env.NODE_ENV
    if (env === 'development' || process.env.TF_DEV === '1') {
      return getCallerFile({ offset: 3, ...kv })
    }
  }
  static whenDevelopment(kv: FindCallerParams = {}): CodePosition | null {
    if (isDeveloperMode()) {
      return getCallerFile({ offset: 3, ...kv })
    }
  }

  /** @deprecated use .here */
  static forFile(path: string, kv: { debug? } = {}) {
    // let obj = new this()
    // return obj.findCallerFile({ referenceFile: path, debug: kv.debug })
  }

  // TODO:dedup-packages
  // export const callingFile = (
  /** @deprecated use .here */
  findCallerFile(kv: {
    referenceFile: string
    stack?: string
    debug?: boolean
  }): SourcePosition | null {
    let stack = kv.stack
    if (!stack) {
      let e = new Error()
      stack = e.stack ?? ''
    }

    let stackLinesReverse = stack.split('\n').reverse()
    // console.log(stackLinesReverse)
    // console.log(stack)

    let index = stackLinesReverse.findIndex(x => x.includes(kv.referenceFile))
    // console.log({ stack, index, kv })

    if (index === -1 && tryGetSourceFile) {
      let altFile = tryGetSourceFile(kv.referenceFile)
      if (!altFile) {
        return null
      }
      index = stackLinesReverse.findIndex(x => x.includes(altFile))
    }

    if (index === -1) {
      // could not find
      console.log('DEV BUG', __filename)
      console.log('Problem finding trace', {
        index,
        file: kv.referenceFile,
        stack,
      })
      return SourcePosition.build({
        file: 'xxx-no-file-found',
        lineNumber: 1,
        columnNumber: 1,
      })
    }
    // console.log(stackLinesReverse, index)

    if (index === 0) {
      // ??? for spec bugfix
      index = 2
    }
    let search = stackLinesReverse.slice(0, index).reverse()
    // if (index === 0 && search.length === 0) {
    //   search = stackLinesReverse.slice(0, 2).reverse()
    // }
    for (let x of search) {
      if (x.includes('/node_modules/')) {
        continue
      }
      // let rx = /(\S*):.*:/
      let rx = /(?<file>[\w/.]\S*):(?<lineNumber>.*):(?<columnNumber>\d+)/
      let ma = x.match(rx)

      // $dev({ x, ma })

      // console.log({ rx, ma })
      if (ma) {
        let copy: any = { ...ma.groups }
        copy.lineNumber = parseInt(copy.lineNumber)
        copy.columnNumber = parseInt(copy.columnNumber)
        let file = copy.file
        // if (file === 'Object.each') {
        //   console.error({ copy, x, kv })
        // }
        let final = SourcePosition.build({
          file,
          lineNumber: copy.lineNumber,
          columnNumber: copy.columnNumber,
        })
        if (final.file.includes('_build/code')) {
          // TODO:bug bad source line on code reload after require.cache delete
        }
        return final
      }
    }

    return null
  }
}
