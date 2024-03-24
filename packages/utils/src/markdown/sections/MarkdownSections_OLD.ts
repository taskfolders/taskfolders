import { $log } from '../../logger/index.js'
class OneMarkdownSection {
  _lines
  static createZero
  static build
  finish_NEXT
  static from
  toText
  isModified
  isSectionZero
}
let isHeaderLine
let rxHeader

/**
 * @uid b7a0159a-7e6a-4d35-aa7e-1d0c40e58c4d
 * @maturity capable, solid
 */
export class MarkdownSections {
  bodyLineOffset: number
  get all() {
    if (!this._parsed) {
      // TODO before:release
      $log.warn('Not yet parsed')
    }
    return this._all
  }

  _all: OneMarkdownSection[] = []
  _parsed = false
  #body: string

  constructor(kv: { body: string; bodyLineOffset: number }) {
    this.#body = kv.body
    this.bodyLineOffset = kv.bodyLineOffset
  }

  parse_Next() {
    if (this._parsed) {
      // TODO before:release
      $log.warn('Double parse')
    }
    this._parsed = true

    if (!this.#body) {
      this._all = [
        OneMarkdownSection.createZero({ lineNumber: this.bodyLineOffset }),
      ]
      return this._all
    }

    let lines = this.#body.split('\n')
    // let acu_currentSection = [lines[0]]

    let sections: OneMarkdownSection[] = []
    let currentSection: OneMarkdownSection

    lines.forEach((line, idx) => {
      // $dev({ line, idx })
      if (isHeaderLine(line) || idx === 0) {
        let head
        // if (isHeaderLine(line)) {
        //   // head = acu_currentSection.shift()
        //   head = line
        // }
        currentSection = OneMarkdownSection.build({
          lineNumber: idx + this.bodyLineOffset,
        })
        sections.push(currentSection)
        // $dev({ currentSection, head, line })
      }
      currentSection._lines.push(line)
      // acu_currentSection.push(line)
    })
    // $dev(sections, 0, { customInspect: false })

    sections.forEach(x => x.finish_NEXT())

    if (sections[0].isSectionZero() === false) {
      // TODO #clean create zero?
      let zero = OneMarkdownSection.createZero({
        lineNumber: this.bodyLineOffset,
      })
      sections = [zero, ...sections]
    }

    this._all = sections
    return sections
  }

  parse_o1(): OneMarkdownSection[] {
    // let rx = /#.*ISSUE/

    let currentSection = OneMarkdownSection.build({
      _title: null,
      lineNumber: 1,
      meta: {},
      topic: null,
      level: 0,
      tags: [],
    })

    let sections = this._all
    sections.push(currentSection)

    let hasContent = !(this.#body === null || this.#body === undefined)
    if (hasContent) {
      // not null or undefined

      // TODO review? why TS needs this??? (watcher tsc, not tsc)
      let isFrontMatter = false

      let lines = this.#body.split(/\r?\n/)
      for (let [lineNumber, line] of Array.from(lines.entries())) {
        // let lineNumberJustBody = lineNumber
        // body offset counts from 0, line numbers from 1
        let lineNumberWithOffset = lineNumber + this.bodyLineOffset + 1

        let isHeaderLine = line.match(rxHeader)
        if (isHeaderLine) {
          // TODO:md-parser-clean time mark convert externally?? or in sanitize/lint stage?
          if (currentSection) {
            // TODO:finish
            currentSection.finish_o1()
          }

          // $dev({
          //   lineNumber,
          //   lineNumberWithOffset,
          //   t: this._rawParts.bodyLineOffset,
          // })
          currentSection = OneMarkdownSection.from({
            head: line,
            payload: [],

            // TODO drop after a while working
            // lineNumber: lineNumberWithOffset + this.documentBodyOffset,
            lineNumber: lineNumberWithOffset,
          })

          // currentSection.lintRules = this.frontMatter.lint?.['rules']

          sections.push(currentSection)
        } else if (line.match(/^---\s*$/)) {
          isFrontMatter = !isFrontMatter
          currentSection.hasFrontMatterDashes = true
        } else {
          // No isHeaderLine
          if (isFrontMatter) {
            currentSection._frontLines.push(line)
          } else {
            // TODO:md-dedup-section-parse
            let likeDataLine = line.match(/^\s*([\S]+):\s\S/)
            let likeArrayValue = false // line.match(/^\s+ -/)
            let notLink = !line.startsWith('http')
            let noBodyLines = currentSection._bodyLines.length === 0

            if (
              (likeDataLine || likeArrayValue) &&
              notLink &&
              noBodyLines &&
              // section zero will never have fm
              // it is the whole document fm
              !currentSection.isSectionZero()
            ) {
              line = line.replace(/:\s*/, ': ') // ensure one space after colon
              currentSection._frontLines.push(line)
            } else {
              currentSection._bodyLines.push(line)
            }
          }
        }
      }
    }

    // TODO:finish
    // if (currentHeaderSection.isSectionZero())
    // $dev.dir(currentSection)
    currentSection.finish_o1()
    // $dev({ text: currentSection.toText() })

    // TODO:md-format drop empty Zero section when empty ??
    // if (sections[0].body === '') {
    //   // remove
    //   if (process.env.FFB_MD !== '1') {
    //     sections.shift()
    //   }
    // }

    return this._all
  }

  isModified() {
    let found = this._all.find(x => x.isModified())
    return !!found
  }

  toText(kv: { forHtml? } = {}) {
    let all = this.all.map(one => {
      return one.toText({ forHtml: kv.forHtml })
    })
    return all.filter(x => typeof x === 'string').join('\n')
  }

  toJSON() {
    return {
      all: this.all,
      bodyLineOffset: this.bodyLineOffset,
    }
  }
}
