// import { delay } from '../native/promise'
import { expectType } from '@taskfolders/core/types/expectType'
import { delay } from '../native/promise/delay'
import {
  DependencyContainer,
  DependencyContainer as DC,
  DependencyToken,
  DependencyError,
} from './DependencyContainer'
import { expect } from 'expect'
// import { Curl } from '../network/curl/Curl'
// import { expectType } from '../types/expectType'
// import { LocalFileSystem } from '../filesystem'

@DC.injectable('singleton')
class SomeSingleton {
  text = 'hi world'
}
class Curl {}

function setup() {
  let sut = new DC()
  return sut
}

function setupNested() {
  let parent = new DC()
  let child = new DC({ parent })
  return child
}

@DC.injectable('scope')
class OneAsync {
  fox
  started

  @DC.start('await')
  async create() {
    await delay(1)
    this.fox = 123
    this.started = true
  }
}

@DC.injectable({
  lifetime: 'singleton',
})
class OneSync {
  fox = 'tango'
}

describe('x', () => {
  describe('tokens #next', () => {
    class Panda {
      dep = DC.inject(SomeSingleton)
      constructor(public value: number) {}
    }

    function fetch<T>(ref: typeof DependencyToken<T>): T {
      return null
    }

    it('x #todo #next #now', async () => {
      type Get<Type> = Type extends DependencyToken<infer X> ? X : never

      // function fetch<T extends ValueReference<any>>(ref: T): Get<T>

      class PlayCurl extends DependencyToken<Curl> {
        // value = Curl.fromJsonAPI('ws://example.com')
        constructor() {
          super()
          // this.value = Curl.fromJsonAPI('ws://example.com')
        }
      }

      type foo = Get<PlayCurl>

      let res = fetch(PlayCurl)

      let err = new DependencyError('foo')
      $dev({
        pass: err instanceof DependencyError,
        err: err instanceof Error,
      })
    })

    it('preset value', async () => {
      class Auth {
        dep = DC.inject(SomeSingleton)
        constructor(public value: number) {}
      }

      const AuthToken = DependencyToken.define<Auth>({
        presetValue: true,
        lifetime: 'auth',
      })
      let sut = setup()

      expect(() => {
        sut.fetch(AuthToken)
      }).toThrow(/Token.*to be preset.*:auth/)

      sut.registerValue_1(AuthToken, new Auth(123))

      let res = sut.fetch(AuthToken)
      expect(res.value).toBe(123)
    })

    it('factory sync', async () => {
      let spy = { one: 0, two: 0 }
      const PandaOne = DependencyToken.define<Panda>({
        lifetime: 'singleton',
        // TODO rename to .create #now
        create() {
          spy.one++
          return new Panda(1)
        },
      })

      const PandaTwo = DependencyToken.define<Panda>({
        lifetime: 'transient',
        create() {
          spy.two++
          return new Panda(2)
        },
      })

      let sut = setup().child('auth')

      let res = sut.fetch(PandaOne)
      expect(spy.one).toBe(1)
      res = sut.fetch(PandaOne)
      expect(spy.one).toBe(1)
      expect(res.dep.text).toBe('hi world')

      let container = sut._parent
      expect(container.type).toBe('root')
      expect(container._content.has(PandaOne)).toBe(true)

      res = sut.fetch(PandaTwo)
      res = sut.fetch(PandaTwo)
      expect(res.dep.text).toBe('hi world')
      expect(spy.two).toBe(2)
    })

    describe('async create', () => {
      const PandaToken = DependencyToken.define<Panda>({
        lifetime: 'singleton',
        // TODO rename to .create #now
        async create() {
          await delay(1)
          return new Panda(1)
        },
      })

      it('fail .fetch if async create', async () => {
        let sut = setup()
        expect(() => sut.fetch(PandaToken)).toThrow(/Token has async/)
      })

      it('fetch async', async () => {
        let sut = setup()

        let res = await sut.fetchAsync(PandaToken)

        expect(res.value).toBe(1)
        expect(res.dep.text).toBe('hi world')
      })

      it('.fetch is OK after warmup', async () => {
        let sut = setup()
        await sut.warmup(PandaToken)
        let res = sut.fetch(PandaToken)

        expect(res.value).toBe(1)
        expect(res.dep.text).toBe('hi world')
      })
    })
  })

  it('main #story', async () => {
    let sut_global = new DC()
    class Config {
      greeting = 'hello'
    }
    sut_global.registerValue_1(Config, new Config())

    class User {
      id: string
      constructor(id: string) {
        this.id = id
      }
    }

    class UserService {
      _users: Record<string, { tenant }>

      async start() {
        await delay(1)
        this._users = {
          john: { tenant: 123 },
        }
      }
    }

    class PandaHandler {
      config = DC.inject(Config)
      user = DC.inject(User)
      ctx = DC.inject(UserService)

      execute() {
        let { tenant } = this.ctx._users[this.user.id]
        return `${this.config.greeting} ${this.user.id} tenant:${tenant}`
      }
    }

    let sut_child = sut_global.child()
    sut_child.registerValue_1(User, new User('john'))
    // TODO move to _global
    sut_child.registerSingleton(UserService, async () => {
      let obj = new UserService()
      await obj.start()
      return obj
    })

    let han = new PandaHandler()
    await sut_child.applyInjectsAsync_DROP(han)

    let res = han.execute()
    expect(res).toBe('hello john tenant:123')
  })

  describe('life types', () => {
    describe('singleton', () => {
      it('created on parent, not child', async () => {
        let sut = setupNested()
        let spy = 0

        @DC.injectable({ lifetime: 'singleton' })
        class Panda {
          constructor() {
            spy++
          }
        }

        sut.fetch(Panda)
        sut.fetch(Panda)
        let r1 = sut.fetch_X({ klass: Panda })
        $dev(r1)

        expect(spy).toBe(1)
        expect(sut._content.has(Panda)).toBe(false)
        expect(sut._parent._content.has(Panda)).toBe(true)
      })
    })

    describe('scope', () => {
      it('refuse declaration within the root container', async () => {
        let sut = setupNested()
        let spy = 0

        @DC.injectable({ lifetime: 'scope' })
        class Panda {
          constructor() {
            spy++
          }
        }

        sut.fetch(Panda)
        sut.fetch(Panda)

        expect(sut._content.has(Panda)).toBe(true)
        expect(spy).toBe(1)

        expect(() => sut._parent.fetch(Panda)).toThrow(
          /Refusing.* in root container/,
        )
      })
    })

    describe('value', () => {
      it.skip('x #now #next', async () => {
        let sut = new DC()
        @DC.injectable('value')
        class Panda {
          value = 123
        }
        sut.registerValue(new Panda())
        let res = sut.fetch(Panda)
      })

      it('main #story', async () => {
        let sut = new DC()
        let spy = 0

        @DC.injectable('value')
        class Panda {
          value = 123
          constructor() {
            spy++
          }
        }

        expect(() => sut.fetch(Panda)).toThrow(
          /Value.*dependency.*manually.*:Panda/,
        )

        sut.registerValue(new Panda())
        let res = sut.fetch(Panda)
        expect(res.value).toBe(123)

        expect(() => sut.registerValue(new Panda())).toThrow(
          /Value already registered :Panda/,
        )
      })

      it('value factory by name #draft', async () => {
        let sut = new DC()
        class One {
          constructor(first, kv: { value: string }) {}
        }

        // TODO match klass type to enum type ??
        let foo = [
          [Curl, ['foo', 'bar'] as const],
          [One, 'panda'],
        ]

        type Foo = typeof foo
        function bar<P, T1 extends { new (...args): P }, T extends keyof Foo>(
          a: T1,
          x: T,
        ) {}
        // bar(Curl, 'foo')
        // bar(3)

        // @ts-expect-error TODO:fix-migration
        let val = Curl.fromJsonAPI('http://example.com')
        sut.registerValue_name({ klass: Curl, name: 'zapps', value: val })
        let res = sut.fetchValue(Curl, 'zapps')

        expect(res).toBeInstanceOf(Curl)
        // @ts-expect-error TODO:fix-migration
        expect(res.url.host).toBe('example.com')
      })

      xit('value factory by name and builder #draft', async () => {
        class Panda {
          value = 123
          //
        }

        let sut = setup()
        sut.registerValue_name({
          klass: Panda,
          name: 'foo',
          // @ts-expect-error TODO
          value: () => new Panda(),
        })
      })
    })

    describe('transient', () => {
      it('x', async () => {
        let sut = new DC()
        let spy = 0

        @DC.injectable('transient')
        class Panda {
          value = 0
          constructor(constructor, kv: { fox }) {
            this.value = kv.fox
            spy++
          }
        }

        sut.fetch(Panda, {
          params: {
            fox: 1,
            // TODO should fail ???
            bogus: null,
          },
        })

        let r1 = sut.fetch(Panda, { params: { fox: 1 } })
        expect(r1.value).toBe(1)
        expect(spy).toBe(2)
      })
    })
  })

  describe('use cases', () => {
    describe('with stop', () => {
      it('stop all dependencies', async () => {
        let spy
        @DC.injectable('singleton')
        class Panda {
          @DC.stop()
          async stop() {
            await delay(1)
            spy = true
          }
        }
        let sut = setup()
        sut.fetch(Panda)

        await sut.stop()

        expect(spy).toBe(true)
      })

      it('stop values', async () => {
        let spy
        class Panda {
          @DC.stop()
          async stop() {
            await delay(1)
            spy = true
          }
        }

        let sut = setup()
        sut.registerValue_name({
          klass: Panda,
          name: 'foo',
          value: new Panda(),
        })
        $dev('todo')

        await sut.stop()
      })
    })

    describe('with async start', () => {
      it('in the background', async () => {
        let sut = new DC()

        @DC.injectable('singleton')
        class One {
          value = 1
          @DC.start('background')
          async start() {
            await delay(1)
            this.value = 2
          }
        }

        let res = sut.fetch_X({ klass: One })
        expect(res.value.value).toBe(1)
        // TODO #clean await until done?
        await Promise.all(res.starts)
        expect(res.value.value).toBe(2)
      })

      it('x start after finished #edge #bug', async () => {
        let spy = { service: null, done: null }
        @DC.injectable('singleton')
        class Service {
          @DC.start('background')
          start() {
            $dev('yes!')
            spy.done = true
          }
        }

        @DC.injectable('singleton')
        class Panda {
          ser = DC.inject(Service)

          @DC.start('background')
          start() {
            spy.service = this.ser
            // $dev(this)
            $dev('- inside')
          }
        }

        let sut = setup()
        sut.fetch(Panda)

        // $dev(res)
        expect(spy.service).toBeInstanceOf(Service)
        // $dev(spy)
      })
      it('during fetch / create', async () => {
        let sut = new DC()

        @DC.injectable('singleton')
        class One {
          value = 1
          @DC.start('await')
          async start() {
            await delay(1)
            this.value = 2
          }
        }

        // NOTE forced to use fetchAsync

        let res = await sut.fetchAsync(One)
        expect(res.value).toBe(2)

        expect(() => {
          sut.fetch(One)
        }).toThrow(/use .fetchAsync/)
      })
    })
  })

  describe('lazy build #review', () => {
    it('value #todo', async () => {
      let sut = new DC()
      let spy = 0

      @DC.injectable('value')
      class Panda {
        value
        constructor() {
          spy++
        }
      }
      sut.register_OLD_1(Panda, () => {
        let obj = new Panda()
        obj.value = 123
        return obj
      })

      let res = sut.fetch(Panda)
      expect(res.value).toBe(123)
    })

    it('singleton', async () => {
      let sut = new DC()
      let spy = 0

      @DC.injectable('singleton')
      class Panda {
        value
        constructor() {
          spy++
        }
      }

      sut.register_OLD_1(Panda, () => {
        let obj = new Panda()
        obj.value = 123
        return obj
      })

      sut.fetch(Panda)
      let res = sut.fetch(Panda)
      expect(res.value).toBe(123)
      expect(spy).toBe(1)
    })
  })

  describe('fetch instances', () => {
    describe('sync', () => {
      it('plain sync', async () => {
        let sut = new DC()

        @DC.injectable({
          lifetime: 'singleton',
        })
        class One {
          fox = 'tango'
        }

        @DC.injectable({
          lifetime: 'singleton',
        })
        class Panda {
          value = 123
          alien = DC.inject(One)
        }
        let res = sut.fetch(Panda)
        res = sut.fetch(Panda)

        expect(res.value).toBe(123)
        expect(res.alien.fox).toBe('tango')

        class Bamboo {
          value = 123
          alien = DC.inject(One)
          bar: One
          constructor(cont) {
            this.bar = cont.fetch(One)
          }
        }
        let r2 = sut.create(Bamboo)
        expect(r2.value).toBe(123)
        expect(r2.alien.fox).toBe('tango')
        expect(r2.bar.fox).toBe('tango')
      })

      it('create but no fetch', async () => {
        @DC.injectable({
          lifetime: 'singleton',
        })
        class One {
          delta = 'tango'
        }

        class Panda {
          dep = DC.inject(One)
          fox = 123
        }
        let sut = setup()
        let res = sut.create(Panda)
        expect(res.fox).toBe(123)
        expect(res.dep.delta).toBe('tango')
      })
    })

    describe('async', () => {
      it('object with async constructor', async () => {
        let sut = new DC()

        @DC.injectable({
          lifetime: 'singleton',
          createAsync: x => x.start(),
        })
        class Panda {
          value
          alien = DC.inject(OneSync)

          async start() {
            await delay(1)
            this.value = 123
          }
        }

        let res = await sut.fetchAsync(Panda)

        expect(res.value).toBe(123)
        expect(res.alien.fox).toBe('tango')

        expect(() => sut.fetch(Panda)).toThrow(/use .fetchAsync/)
      })

      it('object with async dependencies #bug', async () => {
        class Panda {
          one = DC.inject(OneAsync)
        }

        let sut = setupNested()

        // TODO next expect will not fail if you create in advance! #bug
        // - but using wrong createSync when not createAsync should fail
        expect(() => {
          let obj = sut.create(Panda)
          // $dev(obj.one)
        }).toThrow(/Async dependencies/)

        // TODO #bug
        $dev('bug!')
        let res = await sut.createAsync(Panda)
        // $dev(res)
        // expect(res.one.fox).toBe(123)
      })

      it('object with async constructor AND dependencies', async () => {
        @DC.injectable({
          lifetime: 'singleton',
          createAsync: x => x.start(),
        })
        class Panda {
          value
          one = DC.inject(OneAsync)

          async start() {
            // async dependencies shall be already resolved
            expect(this.one.fox).toBe(123)
            await delay(1)
            this.value = 123
          }
        }
        let sut = setupNested()
        let res = await sut.fetchAsync(Panda)

        expect(res.one.fox).toBe(123)
      })
    })
  })

  it('ensure dependencies when container is optional', async () => {
    class No {
      value = 123
    }

    @DC.injectable('singleton')
    class Panda {}

    class Yes {
      panda = DC.inject(Panda)
      value = 123
    }

    let container = new DC()
    await DC.ensureDependencies({ container: null, target: new No() })
    await expect(() =>
      DC.ensureDependencies({ container: null, target: new Yes() }),
    ).rejects.toThrow(/Container needed/)

    // await DC.ensureDependencies({ container: null, target: new Yes() })
    await DC.ensureDependencies({ container, target: new Yes() })
  })

  describe('life', () => {
    describe('async', () => {
      // TODO:ugly-double-create ?? needed?
      it('x register and fetch without recreate #story', async () => {
        let spy = false
        @DC.injectable('singleton', {
          async createAsync() {
            $dev('yoo')
            $dev.trace()
            spy = true
          },
        })
        class Panda {
          value: number
        }

        let obj = new Panda()
        obj.value = 123
        let sut = new DC()
        sut.registerValue(obj)

        // CASE when doing a direct fetch (async)
        let r1 = await sut.fetchAsync(Panda)
        expect(spy).toBe(false)
        expect(r1.value).toBe(123)

        class Bamboo {
          fox = DC.inject(Panda)
        }
        let bam = new Bamboo()

        // CASE when ensuring dependencies
        await DC.ensureDependencies({
          container: sut,
          target: bam,
          create: true,
        })
        expect(spy).toBe(false)
      })
    })
  })

  describe('ease testing #todo #dry', () => {
    it('x using mock sub-class', async () => {
      class Tool {
        value = 123
      }

      // TEST
      // @DC.injectable({ mockingClass: Tool })
      @DC.injectable({ mockingClass: true })
      class ToolMock extends Tool {
        string() {
          return this.value.toString()
        }
      }

      class Panda {
        tool = DC.inject(Tool)
      }

      let sut = setup()
      let fake = new ToolMock()
      fake.value = 111

      // TEST
      // sut.mock(ToolMock, fake)
      sut.mock(fake)

      let res = sut.fetch(Panda)
      expect(res.tool.value).toBe(111)
    })

    it('#ts', async () => {
      @DC.injectable('transient')
      class Panda {
        value = 0
      }

      let sut = new DC()
      sut.fetch(Panda)
      sut.hijack(Panda, () => {
        return new Panda()
      })
    })

    it('hijack constructions', async () => {
      let sut = new DC()
      let spy = 0

      @DC.injectable('transient')
      class Panda {
        value = 0
        constructor(constructor, kv: { fox }) {
          this.value = kv?.fox
          spy++
        }
      }

      class Other {}

      sut.hijack(Panda, ctx => {
        expect(ctx.instance.value).toBe(1)
        ctx.instance.value = 123
        // return new Panda(ctx.container, { fox: 123 })
      })
      // .hijack(Other, ctx => {
      //   return ctx.instance
      // })

      let res = sut.fetch(Panda, { params: { fox: 1 } })
      expect(res.value).toBe(123)
    })

    it('x intercept non decorated classes', async () => {
      class Alien {
        value = 123
        constructor() {
          // $dev('alien')
        }
      }
      class Panda {
        dep = DC.inject(Alien)
      }

      let sut = setup()

      let res = sut.create(Panda)
      expect(res.dep.value).toBe(123)

      sut.mock(Alien, () => {
        let next = new Alien()
        next.value = 333
        return next
      })

      // extra feat: search mocks in container tree
      res = sut.child().create(Panda)
      expect(res.dep.value).toBe(333)
    })

    it.skip('x #todo', async () => {
      class Store {
        value = 'tango'
        constructor() {
          $dev('store')
        }
      }
      class Panda {
        store = DC.inject(Store)
      }

      let o1 = new Panda()
      let sut = setup()
      sut.mock(Store, () => {
        $dev('in mock!')
        return new Store()
      })
      sut.applyInjectsSync({ target: o1, create: true })
      // sut.create(Panda)
    })

    describe('capture dependency construction', () => {
      it('injected value', async () => {
        class One {
          value = 'tango'
          constructor(...x) {
            expect(x).toEqual([undefined])
          }
        }

        class Two {
          fox
          constructor(kv: { delta }) {
            this.fox = kv.delta
          }
        }

        $dev('todo')
        class Panda {
          one = DC.inject_2(One)
          // TODO
          // two = DC.inject_2(Two)
          constructor(...x) {
            // TODO with without container?
            // $dev(x)
          }
        }
        let sut = setup()

        sut.mock(One, () => {
          let next = new One()
          next.value = 'delta'
          return next
        })

        // TODO
        // let r1 = sut.fetch_2(Panda, {create:true})
        let r1 = sut.create(Panda)

        expect(r1.one.value).toBe('delta')
      })

      it('with container create', async () => {
        class Vendor {
          value = 'tango'
        }

        class Panda {
          injected: Vendor
          constructor(dc) {
            let obj = DC.ensure(dc).doCreate(Vendor, () => new Vendor())
            expectType<typeof obj, Vendor>()
            this.injected = obj
          }
        }
        let sut = setup()

        sut.mock(Vendor, () => {
          let next = new Vendor()
          next.value = 'delta'
          return next
        })

        // TODO
        // let r1 = sut.fetch_2(Panda, {create:true})
        let r1 = sut.create(Panda)

        expect(r1.injected.value).toBe('delta')
      })
    })
  })

  describe('details', () => {
    describe('control if DC is passed to constructor', () => {
      it('in class definition', async () => {
        let spy = []
        @DC.injectable('singleton', { passContainer: false })
        class One {
          constructor(...x) {
            spy.push(x)
          }
        }
        @DC.injectable('singleton')
        class Two {
          constructor(...x) {
            spy.push(x)
          }
        }

        let sut = setup()
        sut.fetch(One)
        sut.fetch(Two)

        expect(spy[0].length).toBe(0)
        expect(spy[1].length).toBe(1)
        expect(spy[1][0]).toBeInstanceOf(DependencyContainer)
      })

      it('in inject decorator', async () => {
        let spy = []
        class One {
          value = 1
          constructor(...x) {
            spy.push(x)
          }
        }
        class Two {
          value = 2
          constructor(...x) {
            spy.push(x)
          }
        }

        class Panda {
          one = DC.inject_2(One)
          two = DC.inject_2(Two, { passContainer: true })
        }
        let sut = setup()

        let r1 = sut.create(Panda)

        let [one, two] = spy
        expect(one.length).toBe(0)
        expect(two.length).toBe(1)
        expect(two[0]).toBeInstanceOf(DependencyContainer)
      })
    })
  })

  describe('#next', () => {
    describe('control how DC is passed', () => {
      it('x #next #now', async () => {
        class Panda {
          one
          dep = DC.inject(SomeSingleton)

          constructor(kv: { one }) {
            this.one = kv.one
          }
        }

        let sut = setup()
        sut.fetch(Panda)
      })
    })
  })
  describe('x - #draft', () => {
    it('pre register dependency', async () => {
      let spy = 0
      class UserService {
        value = 123
      }

      let sut = new DC()
      sut.registerSingleton(UserService, () => {
        spy++
        let obj = new UserService()
        return obj
      })

      sut.fetch(UserService)
      let res = sut.fetch(UserService)

      expect(spy).toBe(1)
      expect(res.value).toBe(123)
      // @ts-expect-error
      res.bogus
    })

    it('setup class as dependency', async () => {
      let spy = 0

      @DC.injectable({ lifetime: 'singleton' })
      class Tango {
        style = 'cha'
      }

      @DC.injectable({ lifetime: 'singleton', create: () => new Panda() })
      class Panda {
        child = DC.inject(Tango)
        value = 123
        constructor() {
          spy++
        }
      }

      let sut = new DC()

      sut.fetch(Panda)
      let res = sut.fetch(Panda)

      expect(spy).toBe(1)
      expect(res.value).toBe(123)
      expect(res.child.style).toBe('cha')
      // @ts-expect-error
      res.bogus

      let sut_2 = new DC()
      let obj = new Panda()
      sut_2.applyInjectsSync({ target: obj })
    })

    it.skip('x #play to replace constructor', async () => {
      // TARGET want too replace constructor for .forceContainerBuild
      /** STATUS
       * Not possible to replace Panda.constructor
       * You have to wrap(class Panda) and get the wrapper to return Panda replaced by a Proxy (Next) class
       */

      function deco(...a) {
        return function inside(constructor) {
          constructor.prototype = null
        }
      }

      @deco()
      class Panda {
        constructor() {
          $dev('yes')
        }
      }
      class Next {
        constructor() {
          throw Error('boom')
        }
      }

      // let orig = Panda.constructor

      Panda.constructor = function () {
        $dev('ooo')
        throw Error('Only with constructor!')
      }
      Panda.constructor = null
      Panda.prototype.constructor = null

      new Panda()

      Panda.prototype = Next.prototype
      Panda.prototype.constructor = Next.prototype.constructor
      Panda.constructor = Next.constructor
      Object.setPrototypeOf(Panda, Next.prototype)
      new Panda()
      // orig()
    })

    it('specify if dependency must be a container :value', async () => {
      @DC.injectable({ lifetime: 'scope', isValue: true })
      class User {
        id: string
        constructor(con, kv: { id? }) {
          this.id = kv.id
        }
      }
      class Panda {
        user = DC.inject(User)
      }

      let obj = new Panda()
      let sut = setupNested()
      // sut.registerValue(User, new User({ id: 'foo' }))

      let error: Error
      try {
        sut.applyInjectsSync({ target: obj })
      } catch (e) {
        error = e
      }

      // TODO #flaw #risk error.cause is unknown, not Error
      expect(
        // TODO:error-cause
        // @ ts-expect-error TODO #flaw
        error.cause.message,
      ).toMatch('Container must define value')
    })

    it.skip('#bug #edge', async () => {
      @DC.injectable({ lifetime: 'singleton', createAsync: x => x.start() })
      class One {
        fox: { delta }
        async start() {
          await delay(2)
          this.fox = { delta: 123 }
        }
      }

      @DC.injectable({ lifetime: 'singleton' })
      class Panda {
        one = DC.inject(One)
      }
      let sut = setupNested()
      let res = sut.fetchAsync(Panda)
      $dev(res)
    })

    it('type check the constructor of an injectable class', async () => {
      @DC.injectable({ lifetime: 'scope' })
      class P1 {
        constructor() {}
      }
      @DC.define({ lifetime: 'scope' })
      class P2 {
        constructor(x: DependencyContainer) {}
      }
      @DC.define({ lifetime: 'scope' })
      class P3 {
        constructor(x: DependencyContainer, y: number) {}
      }

      // TODO #bug
      // @ ts-expect-error TEST
      @DC.define({ lifetime: 'scope' })
      class P4 {
        constructor(x: number) {}
      }

      @DC.define({ lifetime: 'scope', create: () => new P5() })
      class P5 {}
    })

    it('quick way to declare scope/singleton classes', async () => {
      @DC.define('scope')
      class Panda {}

      let sut = setupNested()
      sut.fetch(Panda)
      expect(sut._content.get(Panda).lifetime).toBe('scope')
    })

    it('injectable classes start constructor with container', async () => {
      let spy

      @DC.define('scope')
      class Panda {
        constructor(container) {
          spy = container
        }
      }

      // TODO #bug
      // @ ts-expect-error TEST
      @DC.define('scope')
      class Bogus {
        constructor(x: number) {}
      }

      let sut = setupNested()
      sut.fetch(Panda)
      expect(spy).toBeInstanceOf(DependencyContainer)
    })

    it('alternative constructor #maybe', async () => {
      let spy = 0
      @DC.define('singleton', { builder_1: 'create' })
      class Panda {
        static create() {
          spy++
          let obj = new this()
          return obj
        }
      }
      let sut = setupNested()
      sut.fetch(Panda)
      expect(spy).toBe(1)
    })

    it('x #ts #tmp', async () => {
      class Foo {
        static build() {
          return 123
        }
      }

      function bar<T extends { new () }, Tk = keyof T>(klass: T, k: Tk): Tk {
        return k as any
      }
      let aa = bar(Foo, 'build')
    })

    it('x injectable - define builder', async () => {
      // TODO decorator with class type
      function DecorateClass<T>() {
        return (classTarget: { new (...args: any[]): T }) => {
          /* ...*/
        }
      }
      function fox<T>() {
        return (target: { new (): T }) => {}
      }

      @fox()
      class Panda {}

      @DecorateClass()
      class Bar {
        value = 1
      }

      @DC.define('singleton', {
        build(dc) {
          // @ ts-expect-error TODO
          let obj = new this() // TEST this is remapped
          obj.value = 123
          return obj
        },
      })
      class Foo {
        value
      }
      let sut = setupNested()
      let res = sut.fetch(Foo)
      expect(res.value).toBe(123)
    })

    describe('x recurse dependencies', () => {
      it('pre-existing dependencies', async () => {
        class Two {
          text = 'two'
        }
        class One {
          text = 'one'
          two = DC.inject(Two)
        }
        class Panda {
          value = 1
          one = DC.inject(One)
        }
        let sut = setup()
        sut.registerValue(new One())
        sut.registerValue(new Two())

        let r1 = await sut.create(Panda)
        expect(r1.one.two.text).toBe('two')
        let r2 = await sut.createAsync(Panda)
        expect(r2.one.two.text).toBe('two')
      })

      it('no pre existing dependencies - create all', async () => {
        class Two {
          text = 'two'
        }
        class One {
          text = 'one'
          two = DC.inject(Two)
        }
        class Panda {
          value = 1
          one = DC.inject(One)
        }
        let sut = setup()

        let r1 = await sut.create(Panda)
        expect(r1.one.two.text).toBe('two')
      })
    })

    it('inject with options #review', async () => {
      class One {
        text
        constructor(con, kv: { text }) {
          this.text = kv.text
        }
      }
      class Panda {
        value = 1

        // TODO inject with options ??? just plain create!
        // one = DC.create(One, { text: 'fox' })
        one = DC.inject_1(One, { text: 'fox' })
      }
      let r1 = await setupNested().create(Panda)
      expect(r1.one.text).toBe('fox')
    })

    it('x - injected values reference their container', async () => {
      @DC.define('transient')
      class One {
        text = 'hi'
      }
      class Panda {
        one = DC.inject(One)
      }
      let res = await setupNested().create(Panda)

      let r1 = DC.container(res.one)
      expect(r1).toBeInstanceOf(DependencyContainer)
    })

    it('x - type check must have properties', async () => {
      type EmptyObject = {
        [K in any]: never
      }
      type t2 = { value? }
      type k1 = keyof t2
      type t1 = keyof t2 extends never ? never : number

      class One {
        constructor(first, kv: { value: string }) {}
      }
      class Two {
        constructor(first, kv: { value?: string }) {}
      }
      class Panda {
        // TODO should fail !!!
        d1 = DC.inject(One)
        d2 = DC.inject_1(One, { value: 1 })
        d3 = DC.inject(Two)
        d4 = DC.inject_1(Two, { value: 1 })
      }
      function foo<
        T extends { new (...x): any },
        T2 = ConstructorParameters<T>[0],
      >(x: T) {}
      foo(One)
    })

    it.skip('x #todo', async () => {
      let sut = new DC()

      class Child {}
      class One {
        config = DC.inject(Child)
      }

      let res = sut.fetch(One)
      let r1 = new One()

      $dev({ res, One, r1 })
      $dev({ ...One })
    })

    it('x multiple injections depend on await-start dependency #edge', async () => {
      let sut = new DC()
      let spy = { construct: 0, start: 0 }

      @DC.define('singleton')
      class Slow {
        started = false
        constructor() {
          spy.construct++
        }

        @DC.start('await')
        async start() {
          await delay(1)
          spy.start++
          this.started = true
        }
      }

      @DC.define('singleton')
      class One {
        dep = DC.inject(Slow)
        constructor(dc) {
          // $dev(this)
          // DC.container(this).applyInjectsSync({target: this})
          // dc.applyInjectsSync({ target: this })
        }
      }

      @DC.define('singleton')
      class Two {
        dep = DC.inject(Slow)
      }

      @DC.define('singleton')
      class Panda {
        one = DC.inject(One)
        two = DC.inject(Two)
      }

      let res = await sut.fetchAsync(Panda)
      expect(spy).toEqual({ construct: 1, start: 1 })
    })

    describe('code after Dependencies injected', () => {
      it('x #decorator #todo #now', async () => {
        @DC.define('singleton')
        class Slow {
          started = false

          @DC.start('await')
          async start() {
            await delay(1)
            this.started = true
          }
        }

        @DC.define('singleton')
        class One {
          dep = DC.inject(Slow)
          constructor(dc) {
            // $dev(this)
            // TODO for Sync only dependencies???
            // DC.container(this).applyInjectsSync({target: this})
            // dc.applyInjectsSync({ target: this })
          }

          // NOTE this always work, async or sync dependencies
          @DC.after()
          setup() {
            $dev('after')
          }
        }
      })
    })

    it('browser scoped during auth #play #draft', async () => {
      @DC.injectable('auth')
      class Controller {
        @DC.stop()
        stop() {
          $dev('in stop')
        }
      }
      let sut = setup().child()
      let res = sut.fetch(Controller)
      await sut.stop()
      $dev('todo')
    })

    it('x fetch with arguments? #todo', async () => {
      class Panda {
        value
        constructor(kv: { one? }) {
          this.value = kv.one
        }
      }

      let sut = setup()

      let r01 = sut.fetch_X({ klass: Panda, params: { one: 1 } })
      $dev(r01)
      // NOW
      return
      let r0 = sut.fetch(Panda, { params: { one: 1 } })
      expect(r0.value).toBe(1)
      // sut.fetch(Panda, { args: [{ one: 1 }] })
      let r1 = sut.fetch_X({ klass: Panda, params: { one: 1 }, _create: true })
      expect(r1.value.value).toBe(1)
      $dev(r1)
    })

    it.skip('x async fetch_x', async () => {
      @DC.injectable('singleton')
      class Panda {
        value

        @DC.start('await')
        async start() {
          await delay(1)
          this.value = 2
        }
      }

      let sut = setup()
      // let r1 = await sut.fetch_X({ klass: Panda })
      // await r1.value
    })

    it('x construct transient with optional container #idea #proto', async () => {
      class Deep {
        text = 'foo'
      }
      class Need {
        deep = new Deep()
        value = 1
      }

      class Panda {
        one: Need

        constructor(dc?: DC) {
          this.one = DC.createEasy(dc, Need, null)
        }
      }

      let res = new Panda()

      function visitDeep<T extends { new () }>(
        obj: object,
        klass: T,
        cb: (x: T) => void,
      ) {
        Object.values(obj).map(x => {
          if (x instanceof klass) {
            cb(x)
          } else {
            visitDeep(x, klass, cb)
          }
        })
      }

      visitDeep(res, Deep, x => {
        $dev('in!')
      })

      class MockDSL<T> {
        instance: T
        host: any
        key: string
        replace(next: T) {
          this.host[this.key] = next
        }
      }
      function mockDeep<T extends { new () }>(
        obj: object,
        klass: T,
        cb: (x: MockDSL<InstanceType<T>>) => void,
      ) {
        Object.entries(obj).map(([key, value]) => {
          if (value instanceof klass) {
            let dsl = new MockDSL<InstanceType<T>>()
            dsl.instance = value
            dsl.host = obj
            dsl.key = key
            cb(dsl)
          } else {
            mockDeep(value, klass, cb)
          }
        })
      }

      mockDeep(res, Deep, x => {
        $dev(x)
        $dev('in!')
      })

      // $dev(res)
    })

    it.skip('x #bugfix', async () => {
      let sut = new DependencyContainer()
      // container.registerValue_1(LocalFileSystem, fs)
      class Child {
        // TODO:fix-migration dropped during migration
        // fs = DC.inject(LocalFileSystem)
      }

      class Panda {
        child = DC.inject(Child)
      }
      let res = sut.fetch(Panda)
      $dev(res)
    })

    it('anonymous values by string label', () => {
      let sut = new DependencyContainer()

      sut.registerByLabel('foo', { fox: 1 })
      // expect(() => {
      //   sut.registerByLabel('foo', { fox: 2 })
      // }).toThrow(/already defined/)

      let res = sut.fetchByLabel('foo')

      expect(res).toEqual({ fox: 1 })

      // #edge boolean false
      sut.registerByLabel('bar', false)
      expect(sut.fetchByLabel('bar')).toBe(false)

      // #edge fail on error
      expect(() => sut.fetchByLabel('bogus')).toThrow(/Unknown value :bogus/)
    })

    it('x logs', async () => {
      class Logger {
        level = 'error'
        constructor(...args) {
          $dev({ args })
        }
      }

      class Panda {
        log = DC.inject(Logger)
      }

      class App {
        panda: Panda
        dc = new DependencyContainer()
        constructor(kv: { debug }) {
          this.panda = this.dc.fetch(Panda)
        }
      }

      let app = new App({ debug: true })
      $dev(app)
    })

    it('x #next #now', async () => {
      // you have on class, needs manual construct, but needs dc
      let sut = setup()

      @DC.injectable('transient')
      class Child {
        value = 1
      }

      // TODO pass [dc, params]
      // TODO pass {dc, ..rest}
      // TODO pass {container, ..rest}
      @DC.injectable('transient', { passContainer: false })
      class Panda {
        dep = DC.inject(Child)
        constructor(kv: { fox: number }) {
          $dev(kv)
        }
      }
      sut.fetch(Panda)

      // CASE
      // - forced to finish with DC as extra step
      // - created object is 'silently' invalid
      let r1 = new Panda({ fox: 3 })
      // sut.finish(f1)
    })

    it.skip('x global container #todo', async () => {
      expect(DC.global).toBeInstanceOf(DC)
    })

    it('x create with constructor', async () => {
      // TODO fail .create if singleton object? (non transient)

      class Panda {
        dep = DC.inject(SomeSingleton)
        constructor(
          public x: number,
          public y: string,
        ) {}
      }

      let sut = setup()
      let res = sut.create_2(Panda, 1, 'some')
      expect(res.dep.text).toBe('hi world')
      expect(res.x).toBe(1)
      expect(res.y).toBe('some')

      if (null as any) {
        // @ts-expect-error TEST
        sut.create_2(Panda, 1)
        sut.create_2(
          Panda,
          1,
          // @ts-expect-error TEST
          2,
        )
      }
    })

    it.skip('x #bug', async () => {
      class Panda {
        value = 12
      }
      const PandaToken = DependencyToken.define<any>({
        lifetime: 'singleton',
        create() {
          $dev('yes')
          return new Panda()
        },
      })

      let sut = setup()

      // @ts-expect-error TODO
      let res = sut.create(PandaToken)
      $dev(res)
    })

    it('capture and intercept random constructions', async () => {
      class Panda {
        constructor(public value: number) {}
      }
      let sut = setup()
      let r1 = sut.create_Object({
        klass: Panda,
        create: () => {
          return new Panda(1)
        },
      })

      expect(r1.value).toBe(1)

      sut.mock_2(Panda, x => {
        $dev('in spy!', x)
        let next = x.create()
        next.value = 2
        return next
      })

      let r2 = sut.create_Object({
        klass: Panda,
        create: () => {
          return new Panda(1)
        },
      })
      expect(r2.value).toBe(2)

      //
    })

    it('x token just yields string', async () => {
      const ConfigDir = DependencyToken.define<string>({
        lifetime: 'singleton',
        create() {
          return '/app/config'
        },
      })
      let dc = new DC()
      let r1 = dc.fetch(ConfigDir)
      expect(r1).toBe('/app/config')

      dc.registerValue_1(ConfigDir, '/tmp/config')
      let r2 = dc.fetch(ConfigDir)
      expect(r2).toBe('/tmp/config')
    })

    it('x no double start on .fetchAsync #edge', async () => {
      let spy = 0
      @DC.injectable('singleton')
      class Panda {
        text = 'hi world'
        constructor() {
          spy++
        }

        @DC.start('await')
        async start() {
          // $dev('start?')
        }
      }
      let dc = new DC()
      await dc.fetchAsync(Panda)
      await dc.fetchAsync(Panda)
      expect(spy).toBe(1)
    })
  }) // #draft
})
