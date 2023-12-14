export function getsert<T extends Record<string, any>>(
  obj: T,
  key: keyof T,
  create: () => T[string],
) {
  let found = obj[key]
  if (!found) {
    found = create()
    obj[key] = found
  }
  return found
}
