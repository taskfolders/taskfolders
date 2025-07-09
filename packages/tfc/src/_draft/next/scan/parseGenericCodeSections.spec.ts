import { parse } from 'path'
import { expect, it } from 'vitest'
import { SectionSummary } from './parseMarkdownSections.js'
import { get } from 'http'
import { parseGenericCodeSections } from './parseGenericCodeSections.js'
import dedent from 'dedent'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const parseJavascriptSections = (body: string): SectionSummary[] => {
  let sections: SectionSummary[] = []
  let lines = body.split('\n')
  for (let [idx, line] of lines.entries()) {
    let getTagValue = (tag: string) => {
      let rx = RegExp(`\\s@${tag} (?<value>\\S+)`)
      let match = line.match(rx)
      //let match = line.match(/^\s+\/\/\s*@sid (?<value>\S+)/)
      if (match) return match.groups.value
    }

    let uid = getTagValue('uid')
    if (uid)
      sections.push({
        type: 'uid',
        value: uid,
        lineNumber: idx,
      })

    let sid = getTagValue('sid')
    if (sid)
      sections.push({
        type: 'sid',
        value: sid,
        lineNumber: idx,
      })
  }
  return sections
}

it('x', async () => {
  // This is a placeholder test to ensure the test suite runs without errors.
  // Add your actual tests here.
  let body = dedent`
    // @uid aaf32c4f-a39a-420f-bff9-ba217f5825b9
    // @sid some-js

    function testFunction() {
      console.log('Hello, World!');
    }
  `
  //let res = parseJavascriptSections(body)
  let res = parseGenericCodeSections({ body, marker: '//' })
  expect(res.length).toBe(2)
  expect(res[0]).toEqual({
    type: 'uid',
    value: 'aaf32c4f-a39a-420f-bff9-ba217f5825b9',
    lineNumber: 1,
  })

  expect(res[1]).toEqual({ type: 'sid', value: 'some-js', lineNumber: 2 })
})

it('x', async () => {
  // This is a placeholder test to ensure the test suite runs without errors.
  // Add your actual tests here.
  let body = dedent`
    # @uid aaf32c4f-a39a-420f-bff9-ba217f5825b9
    # @sid some-js

    function testFunction() {
      console.log('Hello, World!');
    }`
  let res = parseGenericCodeSections({ body, marker: '#' })
  expect(res.length).toBe(2)
  expect(res[0]).toEqual({
    type: 'uid',
    value: 'aaf32c4f-a39a-420f-bff9-ba217f5825b9',
    lineNumber: 1,
  })

  expect(res[1]).toEqual({ type: 'sid', value: 'some-js', lineNumber: 2 })
})
