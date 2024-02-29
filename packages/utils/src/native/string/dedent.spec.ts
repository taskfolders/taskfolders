import { expect, describe, it } from 'vitest'
import { dedent, dedentString } from './dedent.js'
import { default as RawDedent } from 'dedent'

describe('x', () => {
  it('ease building multiline strings', async () => {
    let res = dedent`
      one
      two
        child
          deep`.split('\n')
    expect(res[0]).toBe('one')
    expect(res[1]).toBe('two')
    expect(res[2]).toBe('  child')
    expect(res[3]).toBe('    deep')
  })

  it('x', async () => {
    let foo = expression => `text ${expression} text`
    let r1 = foo`Panda`
    expect(r1).toBe('text Panda text')
  })

  it('x', async () => {
    // let input = [['text ', ''], 123]
    // dedentString(input)
  })

  it('template string', async () => {
    let res = dedent`text ${1} ${2}`
    expect(res).toBe('text 1 2')

    res = dedent`text`
    expect(res).toBe('text')
  })

  describe('expect start with empty line', () => {
    it('function', async () => {
      let t1 = dedentString(`
      one
        two`)

      expect(t1.split('\n')).toEqual(['one', '  two'])

      t1 = dedentString(t1, { startEmpty: true })
      expect(t1.split('\n')).toEqual(['one', '  two'])

      t1 = dedentString(t1, { startEmpty: false })
      expect(t1.split('\n')).toEqual(['one', 'two'])
    })

    it('as template', async () => {
      let t1 = dedent`
      one
        two`

      expect(t1.split('\n')).toEqual(['one', '  two'])
      expect(dedent`${t1}`.split('\n')).toEqual(['one', '  two'])
    })

    it('can be used as a function', async () => {
      let r1 = RawDedent(`fox ${1}`)
      expect(r1).toBe('fox 1')
      let r2 = dedent(`fox ${1}`)
      expect(r2).toBe('fox 1')

      // NOTE Difference here
      let r3 = dedent(`fox ${1}\n  one`)
      expect(r3).toBe('fox 1\n  one')
      let r4 = RawDedent(`fox ${1}\n  one`)
      expect(r4).toBe('fox 1\none')
    })
  })

  it('make it safe to chain/repeat operation', async () => {
    let r1 = dedent(dedent(`fox ${1}\n  one`))
    expect(r1).toBe('fox 1\n  one')

    // NOTE Difference here
    let r3 = dedent(`fox ${1}\n  one`)
    expect(r3).toBe('fox 1\n  one')
    let r4 = RawDedent(`fox ${1}\n  one`)
    expect(r4).toBe('fox 1\none')
  })

  it('x why custom wrap?', async () => {
    let r1 = RawDedent(`
      fox ${1}`)

    let r2 = dedent(`
      fox ${1}`)
    expect(r1).toBe(r2)

    // @ ts-expect-error Cannot be used as function ?? #todo NOT !!!
    RawDedent('one')
    RawDedent`one`
  })
})
