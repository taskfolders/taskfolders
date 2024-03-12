import { expect, describe, it } from 'vitest'
import { ScriptApp } from './ScriptApp.js'
import { fs, vol } from 'memfs'
import * as raw from 'fs'
import { $dev } from '@taskfolders/utils/logger'

it('x', async () => {
  let doFail = false
  let sut = ScriptApp.create({
    dirData: true,
    execute: (ctx: any) => {
      //$dev('execute', ctx)
      if (doFail) throw Error('boom')
      return { fox: 123 }
    },
  })
  sut.fs = fs as any
  vol.fromJSON({ '/app/tasks/.keep': '' })
  sut.source.path = '/app/tasks/build/index.script.ts'
  sut.finish()

  await sut.execute()
  $dev(fs.readFileSync('/app/tasks/build/_data/index.json').toString())

  doFail = true
  await sut.execute()
  $dev(fs.readFileSync('/app/tasks/build/_data/index.json').toString())
  $dev(sut)
})
