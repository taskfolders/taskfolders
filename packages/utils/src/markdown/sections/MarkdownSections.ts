import { extractFrontMatter } from '../extractFrontMatter.js'

export class MarkdownSections {
  _all
  parse_Next
  isModified
  all: { heading: string; body: string; data }[] = []

  static async parse(body: string): Promise<MarkdownSections> {
    let obj = new this()
    let acuSections = []
    let acuLines = []
    let heading
    if (!body) return obj

    let finishSection = async () => {
      let txt = acuLines.join('\n')
      let parts = await extractFrontMatter(txt, {
        guess: true,
      }).catch(e => {
        let error = Error('Unreadable markdown section frontmatter')
        // @ts-expect-error TODO
        error.code = 'md-section-unreadable-fm'
        error.cause = e
        throw error
      })
      //console.dir('..parts')
      //console.dir({ ...parts })

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
