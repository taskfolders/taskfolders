import { expect, describe, it } from 'vitest'

const $dev = console.log.bind(console)
import { dedent } from '../native/string/dedent.js'
import {
  extractFrontMatter,
  extractFrontMatter_v1,
  FrontAndBodyParser,
} from './extractFrontMatter.js'
import { MarkdownDocument } from './MarkdownDocument.js'
let splitText = x => x.split('\n')
let fromYaml

let setup = x => extractFrontMatter(dedent(x), { guess: true })

function splitFront(txt: string) {
  let splitter = splitText(txt)
  let lines = splitText(txt).lines

  let front = []
  let body = []
  let bodyFound: boolean
  let previousPadding: number
  let bodyLineOffset: number
  let seen = {
    dashLines: false,
  }

  if (lines[0] === '---') {
    lines = lines.slice(1)
    seen.dashLines = true
  }

  lines.map((line, idx) => {
    if (bodyFound) {
      body.push(line)
      return
    }

    let ma = line.match(/\s*\S+:\s*/)
    if (ma) {
      previousPadding = ma[0].length
      front.push(line)
    } else {
      let emptyStart = line.match(/^\s+/)
      let stillFront
      if (emptyStart) {
        let linePadding = emptyStart[0].length
        if (linePadding === previousPadding) {
          stillFront = true
        }
      }
      if (stillFront) {
        front.push(line)
      } else {
        body.push(line)
        bodyFound = true
        bodyLineOffset = idx
      }
    }
  })

  if (seen.dashLines) {
    bodyLineOffset += 2
    body = body.slice(1)
  }

  let result = {
    seen,
    front: front.join(splitter.splitter),
    body: body.join(splitter.splitter),
    bodyLineOffset,
  }
  return result
}

describe.skip('x', () => {
  describe('split parts', () => {
    it('all', async () => {
      let res = extractFrontMatter(dedent`
      ---
      fox: 1
      tango: 2
      ---

      more`)

      expect(res).toMatchObject({
        frontData: { fox: 1, tango: 2 },
        frontRaw: dedent`
          ---
          fox: 1
          tango: 2
          ---`,
        body: '\nmore',
        bodyLineOffset: 4,
        error: undefined,
      })
      //
    })

    it('just front-matter', async () => {
      let res = extractFrontMatter(dedent`
        ---
        fox: 1
        ---`)

      expect(res).toMatchObject({
        frontData: { fox: 1 },
        body: null,
        bodyLineOffset: 3,
        error: undefined,
      })

      let sut = await extractFrontMatter(dedent`
        ---
        tango: 1
        ---\n`)
      expect(sut.body).toBe('')
    })

    it('just body', async () => {
      let res = await extractFrontMatter('hello')
      expect(res).toMatchObject({
        frontData: undefined,
        body: 'hello',
        bodyLineOffset: 0,
        error: undefined,
      })
    })

    it('sanitize', async () => {
      // by default 'foo:one' is not identified as object
      let sut = await extractFrontMatter(dedent`
      ---
      foo:one
      ---
      more`)

      expect(sut.frontData.foo).toBe('one')
    })
  })

  describe('errors', () => {
    it('invalid YAML', async () => {
      let sut = await extractFrontMatter(dedent`
      ---
      fox: 1
      tango
      ---
      more
      `)
      expect(sut.body).toBe('more')
      expect(sut.error.name).toBe('YamlError')

      expect(() => sut.frontDataSafe()).toThrow(/parse YAML/)
      //
    })

    it('just string, no object', async () => {
      let sut = await extractFrontMatter(dedent`
      ---
      tango
      ---
      more`)
      expect(sut.error.name).toBe('YamlError')
      expect(sut.error.message).toMatch(/No YAML object/)
    })
  })
  describe('x #next', () => {
    it('x implicit front-matter as in MultiMarkdown #next', async () => {
      let txt = dedent`
      fox: 1
      long:  some
             long text

      more`

      let res = splitFront(txt)
      let d1 = fromYaml(res.front)
      // $dev(txt)
      // $dev(res)
      // $dev(d1)
      $dev('todo')
      expect(d1.long).toBe('some long text')
    })

    it('x with dashes', async () => {
      let txt = dedent`
      ---
      fox: 1
      long:  some
      ---

      more`
      let res = splitFront(txt)
      $dev(res)
      expect(res.body).toBe('\nmore')
      expect(res.bodyLineOffset).toBe(4)
    })
  })

  describe('x #draft', () => {
    it('dos \\r', async () => {
      let txt = 'ssh key\r\nssh-keygen -t \r\nyes'
      let res = await extractFrontMatter(txt)
      expect(res.body).toBe(txt)
    })

    it('x preserve format and comments', async () => {
      let sut = await extractFrontMatter(dedent`
        ---
        one: 1
        
        # some comment
        two: 2
        ---
        
        the body`)

      let txt = sut.doc.toString()
      expect(txt).toBe(dedent`
        one: 1
        
        # some comment
        two: 2\n`)
      $dev({ txt })
    })

    it.skip('x', async () => {
      let body = dedent`
        some

        ---

        FOCUS RPC message 

        # vim: nowrap`
      let sut = extractFrontMatter_v1(body)
      $dev(sut)
    })

    it('x infer fm without delimiters', async () => {
      let raw = dedent`
        tags: one
        
        the body`

      let sut = FrontAndBodyParser.parse(raw)
      $dev('- finish?, more?, drop?')

      let old = await extractFrontMatter(
        dedent`
        tags: one
        
        the body`,
        { guess: true },
      )
      let r1 = { ...old, doc: null }
      let r2 = await r1.getData()
      expect(r2).toEqual({ tags: 'one' })
      expect(r1.body).toBe('\nthe body')
    })

    it('x #edge #fixes', async () => {
      let old = await extractFrontMatter(`tags: one`, { guess: true })
      expect(old.frontData).toEqual({ tags: 'one' })
      let r2 = await extractFrontMatter('21:00 fox', { guess: true })
      expect(r2.body).toBe('21:00 fox')
    })

    it('no body #edge', async () => {
      let sut = await extractFrontMatter(`tags: one`, { guess: true })
      expect(sut.body).toBe(null)
      let res = await sut.getData()
      expect(res).toEqual({ tags: 'one' })
      expect(sut.bodyLineOffset).toBe(0)
    })

    it('x null #edge', async () => {
      let sut = await extractFrontMatter(null, { guess: true })
    })

    describe('broken yaml #edge', () => {
      it('missing close', async () => {
        let sut = await setup(`
          ---
          Hello Kate`)
        expect(sut.error).toBeTruthy()
      })
    })

    it('x #bugfix #edge', async () => {
      let body = dedent`
        tags: 1
        tags: 1`
      let sut = await setup(body)
      // $dev(sut)
      expect(sut.error).toBeTruthy()
      expect(sut.frontText).toBe(body)
      expect(sut.frontRaw).toBe(body)
    })

    it('x detect yaml #now #next', async () => {
      const y1 = `
  key1: value1
  key2:
    - item1
    - item2
  key3: |
    multiline
    text
`
      let y2 = dedent`
        foo: 1
        bar: 
          - a
          b: 3
        
        text`
      let sut = setup(y1)

      let lines = y2.split('\n')
      let paragraphEnd = lines.findIndex(x => /^\s*$/.test(x))
      let firstParagraph = lines.slice(0, paragraphEnd).join('\n')

      const yamlBlockRegex = /^ {0,}.*(?:\n {2,}.*)*/gm
      const matches = firstParagraph.match(yamlBlockRegex)
      $dev({ matches })
      let data
      try {
        data = fromYaml(firstParagraph)
      } catch (_) {
        //
      }
    })
  }) // #draft
})
