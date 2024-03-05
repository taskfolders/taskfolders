import { DC, Container, getAllValuesUp } from './DC.js'
import { DependencyToken } from './DependencyToken.js'
import { DependencyMeta, ILifeTime } from './DependencyMeta.js'
import { delay } from '../native/promise/delay.js'
import { FetchAsyncError, UnregisteredValueError } from './errors.js'
import { inspect } from 'node:util'
import { $dev } from '../logger/index.js'
import { expect, describe, it } from 'vitest'
import { expectType } from '../types/expectType.js'

// TODO global?

describe('constructions', () => {
  it('singleton', async () => {
    let spy = 0
    class Panda {
      constructor() {
        spy++
      }
    }
    DC.decorate(Panda, { lifetime: 'singleton' })

    let sut = new DC()
    let res = sut.fetchRaw({ klass: Panda })
    expect(res.instance).toBeInstanceOf(Panda)

    sut.fetchRaw({ klass: Panda })
    expect(res.instance).toBeInstanceOf(Panda)

    res = sut.fetchRaw({ klass: Panda })
    expect(spy).toBe(1)
  })

  it('transient', async () => {
    let spy = 0
    class Panda {
      constructor() {
        spy++
      }
    }
    DC.decorate(Panda, { lifetime: 'transient' })

    let sut = new DC()
    let res = sut.fetchRaw({ klass: Panda })
    expect(res.instance).toBeInstanceOf(Panda)

    sut.fetchRaw({ klass: Panda })
    expect(res.instance).toBeInstanceOf(Panda)

    res = sut.fetchRaw({ klass: Panda })
    expect(spy).toBe(3)
  })

  it('value', async () => {
    let token = DependencyToken.define<number>({ type: 'value' })
    let sut = new DC()

    let error
    try {
      sut.fetch(token)
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(UnregisteredValueError)

    sut.register(token, { value: 111 })
    let r1 = sut.fetch(token)
    expect(r1).toBe(111)

    class Panda {
      constructor(public delta) {}
    }
    DC.decorate(Panda, { lifetime: 'value' })

    sut.register(Panda, { value: new Panda(222) })
    let r2 = sut.fetch(Panda)
    expect(r2.delta).toBe(222)
  })
})

describe('construction of alien classes #todo #review', () => {
  // TODO because you want an easy way to intercept object constructions
  class Foo {
    delta = 123
  }

  it('plain create', async () => {
    class Panda {
      value = 1
      // TODO not part of create
      foo = DC.inject(Foo)
    }

    let sut = new DC()
    let res = sut._create(Panda, {})
    //let res = sut.fetch(Panda)
    expectType<typeof res, Panda>()
    expect(res).toBeInstanceOf(Panda)
    expect(res.value).toBe(1)

    let r1 = sut.fetchRaw({ klass: Panda })
    expect(r1.instance).toBeInstanceOf(Panda)
    expect(r1.instance.value).toBe(1)
    expect(r1.instance.foo.delta).toBe(123)

    // TODO
    // expect(res.foo.delta).toBe(123)
  })

  it('with constructor', async () => {
    let sut = new DC()
    class Panda {
      foo = DC.inject(Foo)
      constructor(public value: number) {}
    }

    let res = sut._create(Panda, { args: [2] })
    // TODO
    // let r1 = sut.finish(res)
    // console.log(r1)
    expect(res.value).toBe(2)

    let r1 = sut.fetchRaw({ klass: Panda, args: [2] })
    expect(r1.instance.value).toBe(2)
    expect(r1.instance.foo.delta).toBe(123)
  })

  it('with factory method', async () => {
    class Panda {
      constructor(public x, public y) {}
      static second() {}
      static factory(x: number, y: number) {
        let obj = new this(x, y)
        return obj
      }
    }

    let sut = new DC()
    // sut.fetch(Panda, { method: 'factory', args: [1, 2] })

    let res = sut._create(Panda, {
      method: 'factory',
      args: [1, 2],
    })
    expect(res.x).toBe(1)
    expect(res.y).toBe(2)

    let r1 = sut.fetchRaw({ klass: Panda, args: [1, 2], method: 'factory' })
    expect(r1.instance.x).toBe(1)
    expect(r1.instance.y).toBe(2)
  })
})

it('x main #story', async () => {
  let sut = new DC()

  class ChildTwo {}
  DC.decorate(ChildTwo, {})
  class ChildOne {
    two = DC.inject(ChildTwo)
  }
  DC.decorate(ChildOne, {})

  class ChildAwait {
    constructor() {
      // $dev('in!')
    }
    async start() {
      //
    }
  }
  DC.decorate(ChildAwait, { start: { method: 'start', type: 'await' } })

  class Panda {
    one = DC.inject(ChildOne)
    //startFront = DC.inject(ChildAsync)
    startBack = DC.inject(ChildAwait)
  }
  DC.decorate(Panda, {})

  let r1 = sut.fetchRaw({ klass: Panda })
  // $dev(r1.dependencies)
  $dev('todo')
})

describe('x async construction', async () => {
  it('await for start', async () => {
    class PandaAsync {
      started
      async start() {
        await delay(2)
        this.started = true
      }
    }
    DC.decorate(PandaAsync, { start: { method: 'start', type: 'await' } })

    class Panda {
      dep = DC.inject(PandaAsync)
    }
    DC.decorate(Panda, {})

    let sut = new DC()
    //let res = sut.fetchRaw({ klass: ChildAwait })

    let res = await sut.fetchAsync(Panda)
    //$dev(res, null, { depth: 5 })
    expect(res.dep.started).toBe(true)
  })

  it('guard fetch to throw on Async fetch', async () => {
    class PandaAsync {
      started
      async start() {
        await delay(2)
        this.started = true
      }
    }
    DC.decorate(PandaAsync, { start: { method: 'start', type: 'await' } })

    let sut = new DC()
    let error: FetchAsyncError
    try {
      sut.fetch(PandaAsync)
    } catch (e) {
      error = e
    }
    expect(error.code).toBe(FetchAsyncError.code)
  })

  it('background start', async () => {
    class FooBackground {
      started
      async start() {
        await delay(2)
        this.started = true
      }
    }
    DC.decorate(FooBackground, {
      start: { method: 'start', type: 'background' },
    })

    let sut = new DC()
    let r1 = await sut.fetchAsync(FooBackground)
    expect(r1.started).toBe(undefined)

    let r2 = await sut.fetchRaw({ klass: FooBackground })
    expect(r2.instance.started).toBe(undefined)
    await r2.started()
    expect(r2.instance.started).toBe(true)
  })
})

describe('mocks', async () => {
  it('quick mock', async () => {
    class Panda {
      constructor(public value = 1) {}
    }
    DC.decorate(Panda)

    let sut = new DC()
    let res = sut.fetch(Panda)
    expect(res.value).toBe(1)
    sut.mock(Panda, {
      onCreate: () => new Panda(2),
    })
    res = sut.fetch(Panda)
    expect(res.value).toBe(2)

    // TEST simplified mock
    sut.mock(Panda, {
      onCreate() {
        return new Panda(3)
      },
    })
    res = sut.fetch(Panda)
    expect(res.value).toBe(3)
  })

  it('replace existing instances', async () => {
    class Panda {
      constructor(public value = 1) {}
    }
    DC.decorate(Panda)

    let sut = new DC()
    let r1 = sut.fetch(Panda)
    expect(r1.value).toBe(1)

    sut.mock(Panda, { onCreate: () => new Panda(2) })

    let r2 = sut.fetch(Panda)
    expect(r2.value).toBe(2)
  })

  describe('using a class mock', () => {
    class RealFS {
      readFileSync() {
        return 'real'
      }
    }

    class RealFSMock extends RealFS {
      readFileSync() {
        return 'fake'
      }
    }
    DC.decorate(RealFSMock, { mockFor: RealFS })

    it('full manual way', async () => {
      // manual way to do it
      let sut = new DC()
      sut.mock(RealFS, {
        onCreate() {
          return new RealFSMock()
        },
      })
      let res = sut.fetch(RealFS)
      expect(res.readFileSync()).toBe('fake')
    })

    it('x', async () => {
      {
        // convenient way to do it
        let sut = new DC()
        sut.mock(RealFSMock, {
          onCreate() {
            return new RealFSMock()
          },
        })
        let res = sut.fetch(RealFS)
        expect(res.readFileSync()).toBe('fake')
      }

      {
        // quick replace singleton
        let sut = new DC()
        sut.mock(new RealFSMock())

        let res = sut.fetch(RealFS)
        expect(res.readFileSync()).toBe('fake')
      }
    })
  })
})

describe('x', () => {
  it('fetch with Token #todo', async () => {
    let DateNowToken = DependencyToken.define({
      name: 'DateNowToken',
      type: 'transient',
      create() {
        return 123
      },
    })

    // TODO #play how to get class name
    abstract class DependencyTokenClass {
      abstract create()
      static type: ILifeTime
      static create<T extends DependencyTokenClass>(this: { new (): T }): T {
        let obj = new this()
        return obj.create()
      }
    }

    class MyToken extends DependencyTokenClass {
      // TODO cast?
      static type = 'transient' as any
      create() {
        return 123
      }
    }

    let sut = new DC()

    let r0 = sut.fetchRaw({ token: DateNowToken })
    expect(r0.instance).toBe(123)
    //expect(r0.name).toBe('DependencyToken')
    expect(r0.name).toBe('DateNowToken')

    // let r1 = sut.fetchRaw({ token: MyToken })
    // r1.instance
    // expect(r1.instance).toBe(123)
    // expect(r1.name).toBe('MyToken')

    let r2 = sut.fetch(DateNowToken)
    expect(r2).toBe(123)

    // TODO normal mock?
    sut.mock(DateNowToken, {
      onCreate() {
        return 1
      },
    })

    let r3 = sut.fetch(DateNowToken)
    expect(r3).toBe(1)
  })

  it.skip('create with args ? #todo #solve', async () => {})

  // TODO:now
  it.skip('easy to inspect #now #dx', async () => {
    let sut = new DC()

    // just some
    expect(sut.name.length).toBe(6)

    let txt = inspect(sut)
    expect(txt).toContain(sut.name)
  })

  it('x global container', async () => {
    let sut = DC.global
    expect(sut).toBeInstanceOf(DC)
    expect(sut.name).toBe('global')
    expect(sut).toBe(Container)
  })

  it('x destroy #alpha', async () => {
    let spy
    class Panda {
      value = 1
      destroy() {
        spy = true
      }
    }
    DC.decorate(Panda, { lifetime: 'singleton', destroy: true })

    let sut = new DC()
    sut.fetch(Panda)

    await sut.destroy()
    expect(spy).toBe(true)
  })

  it('x fork sub containers #alpha', async () => {
    class Panda {
      constructor(public value: number) {}
    }
    DC.decorate(Panda, { lifetime: 'singleton' })

    let parent = new DC({ name: 'parent' })
    let child_1 = parent.fork({ name: 'child-1' })
    let child_2 = child_1.fork({ name: 'child-2' })

    let r1 = parent.fetch(Panda)
    r1.value = 123

    let r2 = child_2.fetch(Panda)
    expect(r2.value).toBe(123)

    expect(inspect(child_2)).toContain('global:parent:child-1')
  })
})
