export function isNodeRuntime() {
  // Check if running in Node.js environment
  if (
    // typeof window === 'undefined' &&
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node
  ) {
    // console.log('Running in Node.js environment')
    return true
  } else {
    //console.log('Running in a browser environment')
    return false
  }
}
