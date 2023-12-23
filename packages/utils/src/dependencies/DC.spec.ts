import { DC, Container } from './DC'
import { DependencyToken } from './DependencyToken'
import { DependencyMeta, ILifeTime } from './DependencyMeta'
import { delay } from '../native/promise/delay'
import { FetchAsyncError, UnregisteredValueError } from './errors'
import { inspect } from 'node:util'

// TODO global?

describe('x', () => {
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

  describe('x mock', async () => {
    it('single class', async () => {
      class Panda {
        constructor(public value = 1) {}
      }
      DC.decorate(Panda)

      let sut = new DC()
      let res = sut.fetch(Panda)
      expect(res.value).toBe(1)
      sut.mockRaw({
        klass: Panda,
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
      sut.mockRaw({
        token: DateNowToken,
        onCreate() {
          return 1
        },
      })

      let r3 = sut.fetch(DateNowToken)
      expect(r3).toBe(1)
    })

    xit('create with args ? #todo #solve', async () => {})

    it('easy to inspect #dx', async () => {
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

      let r1 = DC.ensure(null)
      expect(r1).toBeInstanceOf(DC)

      let r2 = DC.ensure(new DC({ name: 'foo' }))
      expect(r2.name).toBe('foo')
    })

    it('x random class fetch #story', async () => {
      class Panda {
        value = 1
      }

      let sut = new DC()
      let res = sut.fetch(Panda)
      expect(res).toBeInstanceOf(Panda)
      expect(res.value).toBe(1)
    })

    it('x', async () => {
      let someFS = {
        readFileSync() {
          return 'real'
        },
      }

      let fakeFS = {
        readFileSync() {
          return 'fake'
        },
      }

      let sut = new DC()
      //sut.fetch(someFS)
    })
  })
})
