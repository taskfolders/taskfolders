/** remove deeper nested paths #path #helper #unsorted #review */
export function removeDeeperPaths(paths: string[]): string[] {
  // Sort paths by length in descending order
  const sortedPaths = paths.sort((a, b) => a.length - b.length)

  // Use a Set to keep track of valid paths
  const validPaths = new Set<string>()

  // Function to check if a path is a subpath of another
  function isSubpath(path, basePath) {
    return path.startsWith(basePath)
  }

  // Iterate through sorted paths and add them to validPaths if not a subpath
  for (const path of sortedPaths) {
    let isDeeperPath = true

    for (const validPath of validPaths) {
      if (isSubpath(path, validPath)) {
        isDeeperPath = false
        break
      }
    }

    if (isDeeperPath) {
      validPaths.add(path)
    }
  }

  // Convert the Set back to an array and return
  return Array.from(validPaths)
}
