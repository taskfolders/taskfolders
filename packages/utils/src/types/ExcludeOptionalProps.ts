type RequiredKeys<T> = {
  [K in keyof T]-?: unknown extends Pick<T, K> ? never : K
}[keyof T]

export type ExcludeOptionalProps<T> = Pick<T, RequiredKeys<T>>
