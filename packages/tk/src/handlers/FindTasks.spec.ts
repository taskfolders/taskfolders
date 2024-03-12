import { expect, describe, it } from 'vitest'
import { TaskRunnerApp } from '../TaskRunnerApp.js'
import { TaskFinder } from './FindTasks.js'
import { LocalFileSystem } from '@taskfolders/utils/fs/LocalFileSystem'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { $dev } from '@taskfolders/utils/logger'

it('x show #live #noci', async () => {
  let sut = new TaskRunnerApp()
  sut.cwd = '/home/fgarcia/repos/play/tk'
  //let res = await sut._executeShow()
  let r1 = await sut.finder._findBin()
  // let r1 = await sut._findNpm()
  // let r1 = await sut._findMarkdownScripts()
  // let r2 = await sut._findAll()
  r1 = await sut.finder._findTaskScripts()
  // console.log(r1--todo)
})

it('find tasks scripts #todo', async () => {
  let lf = LocalFileSystemMock.fromFake({
    '/app/tasks/do-ts-script/index.script.ts': '',
    '/app/tasks/do-ts/index.ts': '',
    '/app/tasks/do-sh/index.sh': '',
    '/app/tasks/do-bash/index.bash': '',
    '/app/tasks/do-python/index.py': '',
  })
  let dc = new DC()
  let sut = new TaskFinder({ fs: lf.raw, cwd: '/app', dc })
  let res = await sut.findAll()
  $dev(res)
})
