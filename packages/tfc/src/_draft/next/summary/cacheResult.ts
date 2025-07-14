/**
 *
 * TODO rf out to utils
 * @tags decorator, utils
 */

export function cacheResult(...args) {
  let [fn, ctx] = args
  let cacheKey = '__cache__' + fn.name
  // console.log('in log call', ctx)
  // Object.defineProperty(ctx.metadata, cacheKey, { enumerable: false })
  return function (...args) {
    // console.log(`Calling ${fn.name} with arguments:`, args)
    if (!this[cacheKey]) {
      Object.defineProperty(this, cacheKey, {
        enumerable: false,
        writable: true,
      })
      const result = fn.apply(this, args)
      this[cacheKey] = result
      // console.log(`Returned:`, result)
    }
    return this[cacheKey]
  }
}
