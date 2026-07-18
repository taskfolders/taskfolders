import { it, expect, describe } from 'vitest'
import Path from 'path'
import fs from 'fs/promises'
import { IssueSuite } from './IssueSuite.js'
import { LintNpmPackageHandler } from './_draft/LintNpmPackageJsonHandler.js'
import { log } from '../../dc.js'

async function execute() {
  let suite = new IssueSuite({ title: 'git config' })

  let path = Path.join(process.env.HOME as string, 'repos/tf-open/.git/config')

  let body = await fs.readFile(path, 'utf-8')

  suite
    .test(() => {
      let hasUser = body.includes('name = fgarcia')
      if (!hasUser) throw Error('boom')
    })

    .test(() => {
      let hasEmail = body.includes(
        'email = 253157+fgarcia@users.noreply.github.com',
      )
      if (!hasEmail) throw Error('boom')
    })

    .test(() => {
      let hasPersonal = body.includes('url = git@github.com-personal:')
      if (!hasPersonal) throw Error('boom')
      //   log({ out: body })
    })

  await suite.execute()
}

it('run tests', async () => {
  let sut = new IssueSuite()
  let spy = { t1: false, t2: false, t3: false }
  let { test, log } = sut

  sut
    .test(t => {
      spy.t1 = true
      t.log.info('test 1')
    })
    .test('test-2', async t => {
      spy.t2 = true
      t.log.info('test 2')
    })

  // without nesting
  test('test-3', () => {
    spy.t3 = true
    log.info('test 3')
  })

  await sut.execute()

  expect(spy.t1).toBe(true)
  expect(spy.t2).toBe(true)
  expect(spy.t3).toBe(true)
})

it('fail', async () => {
  let sut = new IssueSuite()
  sut.test(() => {
    throw Error('boom')
  })

  let res = await sut.execute().catch(e => e)
  sut.log.info({ res })
})

it('skip', async () => {
  let sut = new IssueSuite()
  sut
    .test(t => {
      return t.skip('my reason')
    })
    .test(t => {
      return t.pending()
    })
    .test('some text')
  let res = await sut.execute_v2()
  expect(res[0].status).toBe('skip')
  expect(res[1].status).toBe('pending')
  expect(res[2].status).toBe('pending')
})

// TODO pending?
it.skip('one check type, but many fail types', async () => {
  let sut = new IssueSuite()
  sut.test('engine', t => {
    return t.fail('no engine specified')
  })
})

it('x', async () => {
  let sut = new IssueSuite()
  sut.test(t => {
    t.warn('one')
    t.warn('two')
    t.fix('some fix')
  })
  let res = await sut.execute()
  console.log(res[0])
})

describe('configuration', () => {
  it('disable checks', async () => {
    let sut = new IssueSuite()
    let spy = { one: false, two: false }

    sut
      .test('one', t => {
        spy.one = true
      })
      .test('two', t => {
        spy.two = true
        expect(t.config.level).toBe('warning')
        expect(t.config.config.fox).toBe(1)
      })

    sut._config.issues['one'] = {
      enabled: false,
    }
    sut._config.issues['two'] = {
      level: 'warning',
      config: { fox: 1 },
    }

    await sut.execute()
    // console.log(res)
    expect(spy).toEqual({ one: false, two: true })
  })

  it('change severity', async () => {
    let sut = new IssueSuite()

    sut
      .test('one', t => {
        t.fail('some reason')
      })
      .test('two', t => {
        t.fail('some reason')
      })

    sut._config.issues['one'] = {
      level: 'warning',
    }

    let res = await sut.execute_v2()

    expect(res[0].status).toBe('warning')
    expect(res[1].status).toBe('error')
  })
})

describe('fixes', () => {
  it('select which fix to apply', async () => {
    let sut = new IssueSuite()
    let spy

    sut.test(t => {
      t.fix('make-public', t => {
        spy = 'one'
      })
      t.fix('make-private', t => {
        spy = 'two'
      })
    })
    sut._config.fixes['make-public'] = {}

    let res = await sut.execute_v2()
    expect(spy).toBe('one')
    console.log(res)
  })
})

describe('x', () => {
  it('x test fields #focus', async () => {
    let sut = new IssueSuite()

    sut.test('one', t => {}).test({ code: 'two', title: 'Second test' })
    await sut.execute()
    $dev(sut._tests)
  })

  it('x prefix', async () => {
    let sut = new IssueSuite({ prefix: 'panda' })

    sut.test('foo', t => {})
    sut._config.fixes['make-public'] = {}
    expect(sut._tests[0].code).toBe('panda/foo')
  })
})
