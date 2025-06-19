export function cleanObjectCopy<T extends object>(
  obj: T,
  filter = (kv: { key: string; value }) => {
    return kv.value === null || kv.value === undefined
  },
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => !filter({ key: _, value: v })),
  ) as Partial<T>
}
