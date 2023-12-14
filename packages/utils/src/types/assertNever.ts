export function assertNever(value: never, message?: string): never {
  throw new Error(message ? message : `Unexpected value "${value}"`)
}
