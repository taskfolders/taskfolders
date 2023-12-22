import { DC } from './DC'
import { DependencyMeta } from './DependencyMeta'

// TODO get and hide container in instance

describe('x', () => {
  // TODO global?
  // TODO mocks?

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

  describe('x', () => {
    it.only('x', async () => {
      class InstanceCollector {
        instances = new Set()
        install = (value, { kind }) => {
          if (kind === 'class') {
            const _this = this
            return function (...args) {
              // (A)
              const inst = new value(...args) // (B)
              _this.instances.add(inst)
              return inst
            }
          }
        }
      }
      function bound(
        originalMethod: any,
        context: ClassMethodDecoratorContext,
      ) {}

      const collector = new InstanceCollector()

      //@collector.install
      class MyClass {
        @bound
        foo() {}
      }

      const inst1 = new MyClass()
    })
    it.only('singleton', async () => {
      let spy = 0
      function deco(...x) {
        $dev('...')
      }

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
      $dev(Panda)
    })

    it('x async start', async () => {
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
        dep = DC.inject(ChildAwait)
      }
      DC.decorate(Panda, {})

      let sut = new DC()
      //let res = sut.fetchRaw({ klass: ChildAwait })
      let res = sut.fetchRaw({ klass: Panda })
      $dev(res, null, { depth: 5 })
    })

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
