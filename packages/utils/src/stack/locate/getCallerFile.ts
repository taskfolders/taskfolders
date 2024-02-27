// Call this function in a another function to find out the file from
// which that function was called from. (Inspects the v8 stack trace)
//
// Inspired by http://stackoverflow.com/questions/13227489

// Other npm package
// https://github.com/sindresorhus/caller-callsite
//
// seems to just call
// https://www.npmjs.com/package/callsites

// import { smp } from './smp.node'
import smp from 'source-map-support'
import { CodePosition } from './CodePosition'

const toClearStackFrame = (all: ICallSite[] | ICallSite) => {
  let toClear = (x: ICallSite) => {
    return { path: x.getFileName(), lineNumber: x.getLineNumber() }
  }
  if (!Array.isArray(all)) {
    return toClear(all)
  }
  return all.map(x => {
    return toClear(x)
  })
}

export interface ICallSite {
  getFunctionName(): string
  getFileName(): string
  getLineNumber(): number
  getColumnNumber(): number
}

export interface FindCallerParams {
  // number of stack frames to skip
  offset?: number

  position?: number
  /** force getting caller file in production */
  inProduction?: boolean

  debug?: boolean
}

export function getCallStack(): ICallSite[] {
  // let env = process.env.NODE_ENV
  // let productionEnv = !(env === 'development' || env === 'test')
  // let productionEnv = !!(env === 'production')

  // let position = kv.position ?? 2
  let position = 2
  if (position >= Error.stackTraceLimit) {
    throw new TypeError(
      'getCallerFile(position) requires position be less than Error.stackTraceLimit but position was: `' +
        position +
        '` and Error.stackTraceLimit was: `' +
        Error.stackTraceLimit +
        '`',
    )
  }

  /* hack to get error CallSite array
   *   https://v8.dev/docs/stack-trace-api
   *
   * WARNING don't do this globally since other packages like source-map-support might have already hijacked this
   */
  let oldPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  let stack = new Error().stack as any as ICallSite[]
  Error.prepareStackTrace = oldPrepareStackTrace

  return stack
}

/** Get caller file
 *
 * WARNING since this is an expensive operation, we assume you want this to
 * ease debugging during development. You still can explicitly force caller
 * file in production
 *
 * WARNING only for v8 runtime
 *
 * TODO browser support? #research #decide
 *   https://www.npmjs.com/package/source-map-support
 *     mentions chrome support !!!
 *     can this solve bad stack trace printer view in Browser?
 */
export function getCallerFile(kv: FindCallerParams = {}): CodePosition {
  if (process.env.DEBUG?.includes('get-caller')) {
    console.log('DEBUG: get caller')
  }
  let stack = getCallStack()

  if (!stack) {
    // TODO fallback to manual string parsing?
    return
  }
  if (!smp) {
    // console.log('-- no browser, TODO')
    return
  }

  let position = 2
  // stack[0] holds this file
  // stack[1] holds where this function was called
  // stack[2] holds the file we're interested in

  let callSiteRaw = stack[position]
  // {
  //   let all = stack.map((x, idx) => {
  //     return { path: x.getFileName(), lineNumber: x.getLineNumber(), idx }
  //   })
  //   $dev({
  //     all,
  //     position,
  //     pi: all[position + 3],
  //   })
  // }

  {
    // $dev({ position, st: toClearStackFrame(callSiteRaw) })
    // $dev(toClearStackFrame(stack)[position])
  }

  if (!callSiteRaw) return null

  if (kv.debug) {
    let start = 1
    stack.map((x, idx) => {
      if (idx < start) return
      console.log(
        //
        ' ',
        idx,
        [
          x.getFileName(),
          ':',
          x.getLineNumber(),
          ' ',
          ` ${x.getFunctionName() ?? ''}`,
        ].join(''),
      )
    })
    let err = new Error()
  }

  {
    // find first file different to this source AND code user
    // WHY? kv.position is not reliable
    //      same file can appear multiple times in stack (nested functions)

    let pathHere = stack[0].getFileName()
    let idx = stack.findIndex(x => x.getFileName() !== pathHere)
    if (!idx) return null
    let pathRequest = stack[idx].getFileName()
    let rest = stack.slice(idx)
    idx = rest.findIndex(x => x.getFileName() !== pathRequest)
    let offset = kv.offset ?? 0
    callSiteRaw = rest[idx + offset]
    if (!callSiteRaw) return null
  }

  // let smp = require('source-map-support')
  let callSite = smp.wrapCallSite(callSiteRaw)

  let fileSource = callSite.getFileName()
  let fileBuild = callSiteRaw.getFileName()
  let context = callSite.getFunctionName() ?? callSite.getMethodName()
  let stackIndex = stack.findIndex(x => x === callSiteRaw)

  // TODO #scaffold
  // $dev({ stackIndex });
  // $dev(stack.map((x, idx) => ({ idx, file: x.getFileName() })));

  // if (kv.toSource) {
  //   // TODO:dry-map-source
  //   file = file.replace('/_build/code/', '/src/').replace(/\.js$/, '.ts')
  // }
  //

  let path = (fileSource ?? fileBuild).replace(/^file:\/\//, '')
  let lineNumber = callSite.getLineNumber()
  let pos = new CodePosition({ path, lineNumber })
  // TODO review if replace needed on esm AND commonjs packages
  if (fileBuild !== fileSource) {
    pos.fileBuild = fileBuild.replace(/^file:\/\//, '')
  }
  pos.columnNumber = callSite.getColumnNumber()
  pos.stack = stack.map(x => smp.wrapCallSite(x))
  pos.stackIndex = stackIndex
  pos.context = context
  return pos
}
