export function isEqual(recipients: string[], recipients1: string[]) {
  if (recipients.length !== recipients1.length) return false
  const setA = new Set(recipients)
  const setB = new Set(recipients1)
  if (setA.size !== setB.size) return false
  for (const r of setA) {
    if (!setB.has(r)) return false
  }
  return true
}
