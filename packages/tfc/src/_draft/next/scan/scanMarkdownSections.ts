import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import { log } from '../../../dc.js'
import { StandardMetadata } from '../StandardMetadata.js'

export const scanMarkdownSections = async (md: MarkdownDocument) => {
  let mds = await MarkdownSections.parse(md.content)
  let full = md.toString().split('\n')
  let acu = []
  let task = /^- \[ \]/m
  for (let sec of mds.all) {
    let title
    let lineNumber
    if (sec.heading) {
      title = sec.heading.replace(/^#+ /, '')
      lineNumber = full.findIndex(x => x.startsWith(sec.heading)) + 1
    }

    if (sec.body.match(task)) {
      acu.push({
        type: 'todo',
        lineNumber,
        title,
      })
    }

    if (title?.startsWith('TODO')) {
      acu.push({
        type: 'todo',
        lineNumber,
        title,
      })
    }
    if (sec.data) {
      let data = new StandardMetadata(sec.data)

      if (data.flags.includes('todo')) {
        acu.push({
          type: 'todo',
          lineNumber,
          title,
        })
      }
    }
  }
  return acu
}
