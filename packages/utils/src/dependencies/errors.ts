export class FetchAsyncError extends Error {
  static code = 'dc-fetch-async'
  code = 'dc-fetch-async'
  name = 'DependencyError'

  constructor() {
    super('Cannot sync fetch dependency with Async construction')
  }
}

export class UnregisteredValueError extends Error {
  static code = 'dc-unregistered-value'
  code = 'dc-unregistered-value'
  name = 'DependencyError'

  constructor() {
    super('Dependencies with :value life cycle must be previously registered')
  }
}
