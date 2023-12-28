import { Logger } from './Logger'
import { setupLogger } from './_test/setupLogger'

describe('x', () => {
  it.only('x', async () => {
    let { sut } = setupLogger({ debug: true })

    let res = sut.dev({ fox: 1 })
    $dev(res)
  })

  it('x #scaffold', async () => {
    let sut = new Logger()
    // sut.level = 'trace'
    // sut._screen.debug = true
    sut.logRaw({ message: 'log raw' })
    sut.trace('log debug')
    sut.debug('log debug')
    sut.info('log info')
    sut.dev('log dev')
    sut.warn('log dev')
    sut.error('log dev')
  })

  it('x log args #todo', async () => {
    let sut = new Logger()
    // sut._screen.debug = true
    // sut.level = 'info'
    sut.dev('log dev')
    sut.dev({ fox: 1 })
  })

  it('x log function #todo', async () => {
    // TODO bug?
    // sut.logRaw({
    //   message: "one",
    //   level: "dev"
    //   // message: () => {
    //   //   return "some text";
    //   // }
    // });
  })
})
