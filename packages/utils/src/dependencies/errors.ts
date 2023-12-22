export class FetchAsyncError extends Error {
  static code = 'dc-fetch-async'
  code = 'dc-fetch-async'
  name = 'DependencyError'

  constructor() {
    super('Cannot sync fetch dependency with Async construction')
  }
}
