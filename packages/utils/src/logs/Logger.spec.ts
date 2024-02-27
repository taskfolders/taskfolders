import { Logger } from './Logger'
import { setupLogger } from './_test/setupLogger'
import { stripAnsiCodes } from '../native/string/stripAnsiCodes'

describe('x', () => {
  describe('log cases', () => {
    it('using level functions', async () => {
      let test = setupLogger({ debug: false })

      test.sut.dev({ fox: 1 })
      let txt = test.screen.text()
      expect(txt).toContain('src/logs/Logger')

      txt = stripAnsiCodes(txt)
      expect(txt).toContain('DEV')
      expect(txt).toContain('object')
      expect(txt).toContain('fox: 1')
      expect(txt).not.toContain('src/logs/Logger')
    })

    it('using raw dsl', async () => {
      let test = setupLogger({ debug: true })
      test.sut.raw({ level: 'dev', message: 'log raw', forceLink: true })
      let ev = test.logs[0]

      expect(ev.levelName).toBe('dev')
      expect(ev.args).toEqual(['log raw'])
    })
  })

  it('x #scaffold', async () => {
    let sut = new Logger()
    // sut.level = 'trace'
    // sut._screen.debug = true
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
