import { PathItem } from './PathItem.js'

export type Input<T> = { path: string; item?: T }
export type Output<T> = Input<T> & { children: Output<T>[] }

export function flatToListTree<T>(flatList: Input<T>[]): Output<T>[] {
  // Sort by path length ascending
  const sorted = [...flatList].sort((a, b) => a.path.length - b.path.length)

  // Map of path -> node
  const allNodes = new Map()
  sorted.forEach(item => allNodes.set(item.path, { ...item, children: [] }))

  // Keep track of which nodes are nested
  const nestedPaths = new Set()

  for (const item of sorted) {
    let closestParent = null
    let longestMatchLength = -1

    for (const possibleParent of sorted) {
      if (possibleParent.path === item.path) continue

      if (possibleParent.path.length >= item.path.length) continue

      if (item.path.startsWith(possibleParent.path + '/')) {
        if (possibleParent.path.length > longestMatchLength) {
          closestParent = possibleParent
          longestMatchLength = possibleParent.path.length
        }
      }
    }

    if (closestParent) {
      allNodes.get(closestParent.path).children.push(allNodes.get(item.path))
      nestedPaths.add(item.path)
    }
  }

  // Return only the top-level nodes
  return sorted
    .filter(item => !nestedPaths.has(item.path))
    .map(item => allNodes.get(item.path))
}

export const flattenTree = (
  x: Output<PathItem>[],
  kv: { now; acu?: Input<PathItem>[] },
): Input<PathItem>[] => {
  let now = kv.now ?? new Date()
  let acu = kv.acu ?? []
  if (!x) return
  for (let node of x) {
    acu.push({ path: node.path, item: node.item })
    flattenTree(node.children, { now, acu })
  }
  return acu
}

export const dropTreeNotStarted = (x: Output<PathItem>[], now = new Date()) => {
  if (!x) return
  for (let node of x) {
    if (node.item.after) {
      if (node.item.after > now) {
        node.children = []
        return
      }
    }
    dropTreeNotStarted(node.children, now)
  }
}
