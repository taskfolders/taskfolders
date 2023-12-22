import { DC } from './DC'
import { DependencyMeta } from './DependencyMeta'
import { delay } from '../native/promise/delay'
import { FetchAsyncError } from './errors'

// TODO get and hide container in instance
// TODO global?
// TODO mocks?

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
        $dev('in!')
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
    $dev(r1)
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

  describe('x', () => {
    it.skip('fetch with Token #todo', async () => {
      class DateNowToken {
        private constructor() {}

        // TODO fake time?
        static create() {
          return new Date()
        }
      }
      let sut = new DC()
      let r2 = sut.fetchRaw({ klass: DateNowToken })
    })
  })
})
