import { expect, describe, it } from 'vitest'
import { TaskExecute } from './ExecuteTask.js'
import { LocalFileSystemMock } from '@taskfolders/utils/fs/test'
import { DC } from '@taskfolders/utils/dependencies'
import { ShellClientMock } from '@taskfolders/utils/shell/test'

it.skip('x #todo', async () => {
  let lf = LocalFileSystemMock.fromFake({
    '/app/tasks/do-ts/index.script.ts': '',
    '/app/tasks/do-bash/index.bash': '',
  })
  let cwd = '/app'
  let shell = new ShellClientMock()
  let dc = new DC()
  let sut = new TaskExecute({
    fs: lf.raw,
    cwd,
    shell,
    dc,
    finder: null as any,
  })
  dc.finish(sut)

  await sut.executePath('/app/tasks/do-bash')
})
