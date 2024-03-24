import { MarkdownDocument } from '../MarkdownDocument.js'
import { MarkdownSections } from './MarkdownSections.js'

/** Fuse a markdown frontmatter with each heading/section frontmatter that has an :id */
export async function fuseMarkdownData(md: MarkdownDocument<any>) {
  let sec = await MarkdownSections.parse(md.content)
  let extras = sec.all
    .map(x => {
      let id = x.data?.id ?? x.data?.lid
      if (id) return { id, data: x.data }
    })
    .filter(Boolean)

  let data = { ...(md.data ?? {}) }
  extras.forEach(item => {
    data[item.id] = item.data
  })
  return data
}
