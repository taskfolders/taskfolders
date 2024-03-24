import { extractFrontMatter } from '../extractFrontMatter.js'

export class MarkdownSections {
  _all
  parse_Next
  isModified
  all: { heading: string; body: string; data }[]

  constructor(kv?) {}

  static async parse(body: string): Promise<MarkdownSections> {
    let obj = new this()
    let acuSections = []
    let acuLines = []
    let heading

    let finishSection = async () => {
      let txt = acuLines.join('\n')
      let parts = await extractFrontMatter(txt, {
        guess: true,
      })
      let data = await parts.getData()
      acuSections.push({ heading, body: parts.body, data })
    }

    for (let line of body.split('\n')) {
      if (line.startsWith('# ')) {
        await finishSection()
        heading = line
        acuLines = []
      } else {
        acuLines.push(line)
      }
    }

    // finish last section
    await finishSection()

    obj.all = acuSections

    return obj
  }
}
