//import { TimeServiceMock } from '@taskfolders/core/native/date/_test'
import { expect, describe, it } from 'vitest'

import dedent from 'dedent'
import { MarkdownDocument } from '../MarkdownDocument.js'
// import { MarkdownSections } from './MarkdownSections.js'
import { $dev } from '../../logger/index.js'
import { MarkdownSections } from './MarkdownSections.js'
import { fuseMarkdownData } from './fuseMarkdownData.js'

const setup_OLD = (x: string) => {
  // TimeServiceMock.fakeTime('2020')
  return MarkdownDocument.fromBody(dedent(x)) as any
}

const setup = async (x: string): Promise<any> => {
  // TimeServiceMock.fakeTime('2020')
  let md = MarkdownDocument.fromBody(dedent(x)) as any
  // await md.parse()
  //return md.sections
}

// TODO to sections
describe.skip('x - OLD', () => {
  it('x', async () => {
    let sut = MarkdownDocument.fromBody(dedent`
        hello
        
        # one
        my one

        ## one child
        some nesting

        # two
        `)

    //await sut.parse()
    let all //= sut.sections._all
    expect(all.length).toBe(4)
    expect(all[0].body).toBe('hello\n')
    expect(all[0].level).toBe(0)

    expect(all[1].body).toBe('my one\n')
    expect(all[1].level).toBe(1)
    expect(all[1].toTextHeaderLine()).toBe('# one')
    expect(all[1].lineNumber).toBe(3)
  })

  describe('parse_Next', () => {
    it('x empty', async () => {
      let sut = new MarkdownSections({ body: '', bodyLineOffset: 0 })
      await sut.parse_Next()
    })

    it('x', async () => {
      let body = `hello`
      let sut = new MarkdownSections({ body, bodyLineOffset: 0 })
      sut.parse_Next()
      expect(sut.isModified()).toBe(false)
      sut._all[0].body += ' more'
      expect(sut.isModified()).toBe(true)
    })

    it('x', async () => {
      let body = dedent`
        hello
        
        # one
        my one

        ## one child
        some nesting

        # two
        fox: 123
        `
      let sut = new MarkdownSections({ body, bodyLineOffset: 0 })
      await sut.parse_Next()
      $dev(sut._all[1])
    })
  })

  describe('parsing sections', () => {
    it.skip('x', async () => {
      let sut = setup_OLD(`
        text before
        # My section
        tags: one
        text

      `)
      let res = sut.parseSections()
      $dev(res)
    })

    it('x - #draft', async () => {
      let sut = setup_OLD(`
      hello

      # TODO:review look for it #panda
      tags: one
      text
      ## Task child
      deeper content
      # Rest`)

      await sut.parse()
      let res = sut.sections._all

      // tags from meta and title
      expect(res[1].data.tags).toEqual(['panda', 'one'])

      // all levels : zero + 2-h1 + 1-h2
      expect(res.length).toBe(4)

      // line numbers
      expect(res[1].lineNumber).toBe(3)
      expect(res[2].lineNumber).toBe(6)

      $dev('NOW')
    })

    it.skip('x with ast', async () => {
      let sut = setup_OLD(`
      # TODO:review look for it #panda
      tags: one
      text
      # Rest`)
      let ast // = fromMarkdown(sut._raw)
      $dev(ast, null, { depth: 5 })
      $dev(ast.children[1])

      let mast = {
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [
              {
                type: 'text',
                value: 'TODO:review look for it #panda',
                position: { start: [Object], end: [Object] },
              },
            ],
            position: {
              start: { line: 1, column: 1, offset: 0 },
              end: { line: 1, column: 33, offset: 32 },
            },
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'tags: one\ntext',
                position: { start: [Object], end: [Object] },
              },
            ],
            position: {
              start: { line: 2, column: 1, offset: 33 },
              end: { line: 3, column: 5, offset: 47 },
            },
          },
          {
            type: 'heading',
            depth: 1,
            children: [
              {
                type: 'text',
                value: 'Rest',
                position: { start: [Object], end: [Object] },
              },
            ],
            position: {
              start: { line: 4, column: 1, offset: 48 },
              end: { line: 4, column: 7, offset: 54 },
            },
          },
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 4, column: 7, offset: 54 },
        },
      }

      // $dev(ast)
    })

    describe('optional dashes ! #alien', () => {
      it('no dashes', async () => {
        let sut = setup_OLD(`
          # Panda
          one: 1
          
          text`)
        let txt = sut.toRaw()
        expect(txt).toContain(dedent`
          # Panda
          one: 1
          
          text`)
      })

      it('already has dashes', async () => {
        let sut = setup_OLD(`
          # Panda
          ---
          one: 1
          ---
          
          text`)
        let txt = sut.toRaw()
        expect(txt).toContain(dedent`
          # Panda
          ---
          one: 1
          ---
          
          text`)
      })
    })

    describe('on errors', () => {
      it('looks like no-dash yaml #edge #alien', async () => {
        let sut = setup_OLD(`
          # Some task
          Sender:
            my address
          
          text`)
        let txt = sut.toRaw()
        expect(txt).toContain(dedent`
          # Some task
    
          Sender:
            my address
          
          text`)
      })

      it('duplicate fields - no dashes', async () => {
        let sut = setup_OLD(`
          # TuneUp
          tags: sole
          tags: cheap
         
          hi`)

        let res = sut.toRaw()

        expect(res).toContain(dedent`
          # TuneUp
          tags: sole
          tags: cheap
          
          hi`)

        $dev('todo')
        // $dev(sut._sections_v1[0])
      })

      it('duplicate fields - dash', async () => {
        let sut = setup_OLD(`
          # TuneUp
          ---
          tags: sole
          tags: cheap
          ---
         
          hi`)

        let res = sut.toRaw()
        expect(res).toContain(dedent`
          # TuneUp
          ---
          tags: sole
          tags: cheap
          ---
          
          hi`)

        // NOW error? checks
      })
    })
  })

  describe('x #draft', () => {
    it.skip('x', async () => {
      let sut = setup_OLD(`
      # TODO legal before:august

      text`)
      let txt = sut.toRaw()
      $dev(txt)
    })

    it('section Zero starts with look-alike yaml #edge', async () => {
      let sut = setup_OLD(`
        Phone: +49 0123
        Reservation Number: 801
        
        # ..
        
        text
      `)

      let txt = sut.toRaw()
      expect(txt).toContain(dedent`
        Phone: +49 0123
        Reservation Number: 801
        
        # ..
        
        text`)
    })

    describe('pretty', () => {
      it.skip('x zero section', async () => {
        let sut = setup_OLD(`
        ---
        fox: 1
        ---

        # TODO legal before:august
        see
        `)
        let txt = sut.toRaw()
        let res = sut.sections._all
        expect(res.length).toBe(2)
        $dev({ see: res[1].toText() })
        $dev({ body: res.map(x => x._bodyLines) })
        $dev({ body: ['---', 'foo:1', '---', ...res.map(x => x.toText())] })
      })

      it('x zero section', async () => {
        let sut = setup_OLD(`
        ---
        fox: 1
        ---`)
        let res = sut.sections._all
        $dev('todo')
        return
        $dev({ see: res[0].toText() })
        $dev({ body: res.map(x => x._bodyLines) })
        $dev({ body: ['---', 'bar:1', '---', ...res.map(x => x.toText())] })
      })
    }) // #pretty

    it('x always zero section', async () => {
      let sut = await setup(`
        ---
        fox: 1
        ---
        # one 
        `)

      expect(sut.all.length).toBe(2)
      expect(sut.all[0].isSectionZero()).toBe(true)
      expect(sut.all[1].headline.line).toBe('one')

      sut = await setup('')
      expect(sut.all.length).toBe(1)
      expect(sut.all[0].isSectionZero()).toBe(true)
    })

    it.skip('x', async () => {
      let sut = setup_OLD(`
        # one 
        tags: fox, one
        # two
        `)
      // let txt = sut.toRaw()
      // $dev(txt)
    })

    it('x', async () => {
      let sut = await setup(`
        # one
        tag: 1
        text
        # two`)

      $dev(sut.all[2].toText())
      $dev(sut.toText())
      $dev(JSON.parse(JSON.stringify(sut)))
    })
  }) // #draft
})

describe('x - OLD', () => {
  it('x', async () => {
    let doc = dedent`
    no heading

    # one
    fox: 1
    
    the first

    # two
    tango: 2
    `
    let sut = await MarkdownSections.parse(doc)
    let res = sut.all
    expect(res.length).toBe(3)
    expect(res[0].heading).toBe(undefined)
    expect(res[1].heading).toBe('# one')
    expect(res[1].data).toEqual({ fox: 1 })
    expect(res[2].heading).toBe('# two')
    expect(res[2].data).toEqual({ tango: 2 })
  })

  it('x', async () => {
    let md = await MarkdownDocument.fromBody<any>(dedent`
      ---
      fox: 1
      ---
        
      # one
      id: first
      delta: 123
      
      # two
      id: second
      tango: fox
    `)

    let res = await fuseMarkdownData(md)
    $dev(res)
  })
})
