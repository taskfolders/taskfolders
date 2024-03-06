/** Forward non existing properties to an alternative target */
export function forwardProxy(kv: { first; alternative }) {
  return new Proxy(kv.first, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else {
        return Reflect.get(kv.alternative, prop, receiver)
      }
    },
  })
}
