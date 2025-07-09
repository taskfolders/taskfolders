import { SectionSummary } from './parseMarkdownSections.js'

export const parseGenericCodeSections = (kv: {
  body: string
  marker?: string
}): SectionSummary[] => {
  let { body, marker = '#' } = kv
  let sections: SectionSummary[] = []
  let lines = body.split('\n')
  for (let [idx, line] of lines.entries()) {
    let lineNumber = idx + 1
    let getTagValue = (tag: string) => {
      let rx = RegExp(`\\s*${marker}\\s+@${tag} (?<value>\\S+)`)
      let match = line.match(rx)
      //let match = line.match(/^\s+\/\/\s*@sid (?<value>\S+)/)
      if (match) return match.groups.value
    }

    let uid = getTagValue('uid')
    if (uid)
      sections.push({
        type: 'uid',
        value: uid,
        lineNumber,
      })

    let sid = getTagValue('sid')
    if (sid)
      sections.push({
        type: 'sid',
        value: sid,
        lineNumber,
      })
  }
  return sections
}
