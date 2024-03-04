interface CustomErrorClass {
  groupName: string
  code: string
}

export class CustomError<T = any> extends Error {
  message: string
  data?: T
  code?: string
  cause?: Error

  static code: string
  static groupName: string

  static is<T extends typeof CustomError<any>>(this: T, error): error is T {
    let klassCode = this.code
    if (!klassCode) {
      throw Error(`Class ${this.name} does not define error code`)
    }
    if (error.code === klassCode) {
      return true
    }
    return false
  }

  constructor(
    msg?: string,
    kv: { data?: T; name?: string; cause?: Error; code?: string } = {},
  ) {
    super(msg)
    let klass = this.constructor as any as CustomErrorClass

    if (kv.name) {
      this.name = kv.name
    } else {
      // @ts-expect-error TODO
      let gn = this.constructor.groupName
      if (gn) {
        this.name = gn
      }
    }
    if (kv.code) {
      this.code = kv.code
    } else if (klass.code) {
      this.code = klass.code
    }
    if (kv.data) {
      this.data = kv.data
    }
    if (kv.cause) {
      this.cause = kv.cause
    }
  }

  static defineGroup<T extends Record<string, typeof CustomError<any>>>(
    groupName: string,
    kv: T,
  ): Record<keyof T, typeof CustomError<any> & CustomErrorClass> {
    Object.entries(kv).forEach(([key, value]) => {
      let val = value as any as CustomErrorClass
      val.groupName = groupName
      val.code = key
    })

    // @ts-expect-error TODO
    return kv
  }

  // static create<T>(
  //   msg: string,
  //   kv: { data?: T; name?: string; cause?: Error; code?: string },
  // ): CustomError<T> {
  //
  // }
  //
}
