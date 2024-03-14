export function getsert<
  T,
  K extends keyof T,
  TBuild extends () => Promise<T[K]> | T[K],
>(
  obj: T,
  key: K,
  build: TBuild,
): ReturnType<TBuild> extends Promise<any> ? Promise<T[K]> : T[K] {
  if (obj[key]) return obj[key] as any
  let value: any = build()
  obj[key] = value
  // if (isPromise(value)) {
  //   value
  //     .then(x => (obj[key] = x))
  //     .catch(e => {
  //       $log.error('Failed getsert')
  //     })
  // } else {
  //   obj[key] = value
  // }
  return value
}
