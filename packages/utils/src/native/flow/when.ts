// const __dirname = dirname(fileURLToPath(import.meta.url))
export const when = <Tin, Tout>(x: Tin, cb: (foo: Tin) => Tout): Tout => {
  if (!x) return
  return cb(x)
}
