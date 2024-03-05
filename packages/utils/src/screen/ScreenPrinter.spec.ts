import { expect, describe, it } from 'vitest'
// TODO:utils-dedup
import { $dev } from '../logger/index.js'
import { dedent } from '../native/string/dedent.js'
import { MemoryScreenPrinter } from './MemoryScreenPrinter.js'
class ScreenPrinterMock extends MemoryScreenPrinter {}

let mp3Xattr = {
  'user.dublincore.contributor': 'CageTheElephant',
  'user.dublincore.date': '2010-10-06',
  'user.dublincore.description': `Official music video for ”Ain't No Rest For The Wicked” by Cage the Elephant\\012Listen to Cage the Elephant: https://CageTheElephant.lnk.to/ListenYD \\012Watch more videos by Cage the Elephant: https://CageTheElephant.lnk.to/ListenYD/youtube \\012\\012Subscribe to Cage the Elephant on YouTube: https://CageTheElephant.lnk.to/subscribeYD \\012\\012Follow Cage the Elephant \\012Facebook: https://CageTheElephant.lnk.to/followYD/facebook \\012Instagram: https://CageTheElephant.lnk.to/followYD/instagram\\012Twitter: https://CageTheElephant.lnk.to/followYD/twitter \\012Tumblr: https://CageTheElephant.lnk.to/followYD/tumblr \\012Website: https://CageTheElephant.lnk.to/followYD/websitegeneral \\012Spotify: https://CageTheElephant.lnk.to/followYD/spotify \\012\\012Lyrics:\\012\\"Oh there ain't no rest for the wicked\\012Money don't grow on trees\\012I got bills to pay, I got mouths to feed\\012There ain't nothing in this world for free\\012Oh no, I can't slow down, I can't hold back\\012Though you know, I wish I could\\012Oh no there ain't no rest for the wicked\\012Until we close our eyes for good\\"\\012\\012#CageTheElephant #AintNoRestForTheWicked #Rock`,
  'user.dublincore.format': '140 - audio only (tiny)',
  'user.dublincore.title':
    "Cage The Elephant - Ain't No Rest For The Wicked (Official Video)",
  'user.xdg.referrer.url': 'https://www.youtube.com/watch?',
}

describe('x', () => {
  it('x', async () => {
    let sut = new MemoryScreenPrinter()
    sut.debugLive = true
    sut.log('foo')
  })

  it('x - debugInline', async () => {
    let sut = new MemoryScreenPrinter()
    sut.debugLive = false
    sut.debugInline = true
    sut.log('foo')
    expect(sut.text({ clean: true })).toBe('screen | foo')
  })

  describe('style/theme', () => {
    it('x #todo', async () => {
      let sut = new MemoryScreenPrinter()
      $dev(sut.style.highlight('one'))
    })
  })

  describe('log2', () => {
    let log = (...x: Parameters<MemoryScreenPrinter['log2']>) => {
      let sut = new MemoryScreenPrinter()
      sut.log2(...x)
      return sut.text({ stripAnsi: true })
    }

    it('log with options', async () => {
      expect(log('one')).toBe('one')
      expect(log('one', { indent: 2 })).toBe('  one')
    })

    it('adapt to given input', async () => {
      expect(log('one')).toBe('one')
      expect(log({ fox: 1, bar: 2 })).toBe(dedent`
        fox: 1
        bar: 2`)
    })
  })

  describe('print objects', () => {
    describe('record', () => {
      it('x', async () => {
        let sut = new MemoryScreenPrinter()
        sut.logRecord({ fox: 1 })
        expect(sut.text({ stripAnsi: true })).toBe('fox: 1')

        sut = new MemoryScreenPrinter()
        sut.logRecord({ fox: 1 }, { indent: 2 })
        expect(sut.text({ stripAnsi: true })).toBe('  fox: 1')
      })

      it.skip('#manual', async () => {
        let sut = new MemoryScreenPrinter()
        sut.logRecord(mp3Xattr, { indent: 2 })
        $dev(sut.text())
      })
    })
  })

  describe('x - #draft', () => {
    it.skip('x print debug line #live', async () => {
      let sut = new MemoryScreenPrinter()
      sut.debug = true
      sut.log('hi')
    })

    it.skip('x', async () => {
      let sut = new MemoryScreenPrinter()
      sut.log('hello {value:green}', { data: { value: 'tango' } })
      $dev(sut.text())
    })

    it.skip('print object #todo', async () => {
      let sut = new MemoryScreenPrinter()
      sut.object({ fox: 1 }).print()
      let txt = sut.text({ stripAnsi: true })
      expect(txt).toBe('fox 1')
    })

    describe('easy to compose line made out of variables', () => {
      it('array of parts', async () => {
        let sut = new MemoryScreenPrinter()
        let one = 'one'
        let two = 'two'
        sut.log([one, null, two])

        expect(sut.text()).toBe('one two')
      })

      it.skip('template #todo #drop', () => {
        let sut = new MemoryScreenPrinter()
        sut.log('hello {name}', { data: { name: 'John' } })
        expect(sut.text()).toBe('hello John')
      })
    })

    // TODO:now
    it.skip('x print debug label when live mode #fixed', async () => {
      let sut = new MemoryScreenPrinter({ liveMode: true })
      sut.debugInline = true
      sut.log('hello')

      expect(sut.text()).toContain('mscode://')
    })

    it('.log screen means merge', async () => {
      let sut = new MemoryScreenPrinter()
      let other = new MemoryScreenPrinter()
      other.log('one')

      sut.log(other)

      expect(sut.text()).toBe('one')
    })

    it('x rewrite logs #more', async () => {
      let sut = new MemoryScreenPrinter()
      sut.debug = true
      sut.log('one')
      // set rewrite marker
      sut.log('two', { rewrite: 'demo' })
      // since rewrite marker is the same... rewrite!
      sut.log('three', { rewrite: 'demo' })
      // no or different rewrite marker => ensure add new line
      sut.log('four')
      $dev(sut)
    })

    it.skip('x - map #broken #bug', async () => {
      let sut = new MemoryScreenPrinter()

      sut
        .log('start')
        .indent()
        .map([1, 2], x => ['item', x])
        .dedent()
        .log('end')

      let res = sut.lines()
      expect(res[0]).toBe('start')
      expect(res[1]).toBe('  item 1')
      expect(res[2]).toBe('  item 2')
      expect(res[3]).toBe('end')
    })

    it('function and theme #todo', async () => {
      let sut = new MemoryScreenPrinter()
      sut.debug = true

      sut
        .log(st => {
          return st.color.green('yes')
        })
        .log(st => [st.section('blue')])
    })

    it('x fix spec printing?', async () => {
      let sut = new MemoryScreenPrinter()
      sut.log('yai!')
    })
  }) // #draft
})
