import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import { log } from '../../../dc.js'
import { StandardMetadata } from '../StandardMetadata.js'
import { TimeMark } from '../TimeMark.js'
import { cleanObjectCopy } from '../cleanObject.js'

export type SectionSummary =
  | {
      type: 'todo'
      lineNumber: number
      title: string
      after?: TimeMark
      before?: TimeMark
    }
  | { type: 'uid' | 'sid'; value: string; lineNumber: number }

export const parseMarkdownSections = async (
  md: MarkdownDocument,
): Promise<SectionSummary[]> => {
  let mds = await MarkdownSections.parse(md.content)
  let full = md.toString().split('\n')
  let acu: SectionSummary[] = []
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
      let after: TimeMark
      if (sec.data?.after) after = TimeMark.fromValue(sec.data.after)

      let before: TimeMark
      if (sec.data?.before) before = TimeMark.fromValue(sec.data.before)

      let next: SectionSummary = {
        type: 'todo',
        lineNumber,
        title: title.replace(/^TODO\s+/, '').trim(),
        after,
        before,
      }
      // @ts-expect-error TODO
      next = cleanObjectCopy(next)
      acu.push(next)
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
