import { it, expect } from 'vitest'
import Path from 'path'
import fs from 'fs/promises'
import { IssueSuite } from './IssueSuite.js'
import { LintNpmPackageHandler } from './_draft/LintNpmPackageJsonHandler.js'

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

it('skip #todo', async () => {
  let sut = new IssueSuite()
  sut.test(t => {
    return t.skip('my reason')
  })
  let res = await sut.execute()
  console.log({ res })
})

it.only('x', async () => {
  let sut = new LintNpmPackageHandler()
  await sut.execute()
})

// TODO pending?
it.skip('one check type, but many fail types', async () => {
  let sut = new IssueSuite()
  sut.test('engine', t => {
    return t.fail('no engine specified')
    return t.fail('old engine')
  })
})
