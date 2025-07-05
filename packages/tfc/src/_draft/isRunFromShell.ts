export const isRunFromShell = (url: string) => {
  return url === process.argv[1] || url === `file://${process.argv[1]}`
}
