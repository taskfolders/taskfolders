export function isPromise<T, S>(obj: PromiseLike<T> | S): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as any).then === 'function'
  )
}
