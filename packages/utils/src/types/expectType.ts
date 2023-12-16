// TODO compare, review
// https://github.com/mmkal/expect-type

type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T
  ? 1
  : 2) extends <G>() => G extends U ? 1 : 2
  ? Y
  : N

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false

type AssertTrue<A extends true> = A
// type Check<X, Y> = AssertTrue<Equals<X, Y>>
type Foo = AssertTrue<Equals<{ id }, { id }>>

export function expectType_2<T>() {
  return {
    // toBe<U>(x: U): AssertTrue<Equals<T, U>> {
    toBe<U extends IfEquals<T, U>>(x: U) {
      return null
    },
  }
}

export function expectType_3<U extends IfEquals<T, U>, T = unknown>(
  x: T,
): IfEquals<T, U> {
  return null
}

export function expectType<T, U extends IfEquals<T, U>>(): IfEquals<T, U> {
  return null
}
