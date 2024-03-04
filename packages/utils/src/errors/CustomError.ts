import { camelToKebab } from '../native/string/camelToKebab.js'

export interface ErrorGroupClass<T> {
  // new ()
  groupName: string
  code: string
  // TODO
  // create(data: T)
}

export type GetErrorData<Type> = Type extends typeof CustomError<infer X>
  ? X
  : never

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
    let klass = this.constructor as any as ErrorGroupClass<T>

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
  ): {
    [key in keyof T]: T[key] &
      ErrorGroupClass<GetErrorData<T[key]>> & {
        create(data: GetErrorData<T[key]>): InstanceType<T[key]>
      }
  } {
    Object.entries(kv).forEach(([key, value]) => {
      let val = value as any as ErrorGroupClass<T>
      val.groupName = groupName
      val.code = val.code ?? camelToKebab(key)
      // @ts-expect-error TODO
      val.create = function (data: T) {
        let obj = new this()
        obj.data = data
        return obj
      }
    })

    // @ts-expect-error TODO
    return kv
  }

  // static create(data) {
  //   let obj = new this()
  //   obj.data = data
  //   return obj
  // }
  //   static create<T>(
  //   msg: string,
  //   kv: { data?: T; name?: string; cause?: Error; code?: string },
  // ): CustomError<T> {
  //   let obj = new this()
  //   return obj

  // }
}
