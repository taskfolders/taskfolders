// import { Yaml } from '../index.node'
// import { CustomError } from '@taskfolders/core/errors'
// import { splitText } from '@taskfolders/core/native/string'

import { $dev } from '../logger/node/index.js'

// import { parseAllDocuments, Document } from 'yaml'

const dataKeyRx = /^[a-zA-Z_-]+:[^/\\]/
let splitText = x => x.split('\n')

class CustomError {
  static create(msg: string, kv) {
    return new Error(msg)
  }
}

export class FrontAndBodyParser {
  _input: string
  data: Record<string, unknown>
  static parse(txt: string) {
    let obj = new this()
    obj._input = txt
    return obj
  }
}

interface MarkdownRawParts_1 {
  frontText: string
  frontRaw: string
  body: string
  error?: Error
  bodyLineOffset: number
  hasDelimiters?: boolean
}

// TODO:md-now
function toParts_v2(kv: { txt; parts; error; doc; data; front }) {
  let { txt, parts, error, doc, data, front } = kv
  let final: MarkdownRawParts_2 = {
    _raw: txt,
    ...parts,
    // _front: data,
    front_yaml: parts.frontText,
    frontText: parts.frontText,
    get frontData() {
      if (error) {
        // NOTE will mess up dev print!
        // throw error
      }
      return data
    },
    set frontData(obj) {
      data = obj
    },
    doc,
    error,

    async getData() {
      // TODO before:release dedup, dry this parse
      //  this should be the only way to get data
      //  this should be the only yaml parser???
      const { parseAllDocuments } = await import('yaml').then(x => x.default)
      let all = parseAllDocuments(front)
      let doc = all[0]
      data = doc.toJSON()
      return data
    },

    [Symbol.for('nodejs.util.inspect.custom')]() {
      let str = [`chars:${txt?.length}`, data ? '+fm' : null].join(' ')
      return `<MarkdownParts ${str} >`
    },
  }
  return final
}

export interface MarkdownRawParts_2 extends MarkdownRawParts_1 {
  _raw: string
  // front: Record<string, any>
  // TODO drop!
  frontData: Record<string, any>
  frontDataSafe?
  /** @deprecated */
  front_yaml
  // frontRaw?: string
  error: Error
  doc //: Document.Parsed
  data?(): Record<string, unknown>
  getData(): Promise<Record<string, any>>
}

function whichLineEnding(source) {
  let temp = source.indexOf('\n')
  if (source[temp - 1] === '\r') return 'CRLF'
  return 'LF'
}

export function extractFrontMatter_v1(
  txt: string,
  kv: { guess? } = {},
): MarkdownRawParts_1 {
  if (txt == null) {
    return { frontText: null, frontRaw: null, body: null, bodyLineOffset: 0 }
  }

  if (txt.startsWith('---')) {
    // TODO re-use line splitter? or better just drop \r and count on same join?
    let lines = txt.split(/\r?\n/)

    let front_yaml_l = []
    let i = 1
    let front_raw_l = [lines[0]]
    while (!lines[i].startsWith('---') && i < lines.length - 1) {
      front_raw_l.push(lines[i])
      i++
    }
    front_raw_l.push(lines[i])

    front_yaml_l = front_raw_l.slice(1, -1)

    let isLastLine = lines.length === i + 1
    let isDashed = lines[i].startsWith('---')
    let noFrontClosingFound = isLastLine && isDashed === false

    if (noFrontClosingFound) {
      return {
        frontText: null,
        frontRaw: null,
        error: Error('No YAML closing found'),
        body: txt,
        bodyLineOffset: 0,
        hasDelimiters: null,
      }
    }
    let front = front_yaml_l.join('\n')

    let bodyStartLine = i + 1
    let bodySlice = lines.slice(bodyStartLine)
    let body = bodySlice.length === 0 ? null : bodySlice.join('\n')

    return {
      frontText: front,
      frontRaw: front_raw_l.join('\n'),
      body,
      bodyLineOffset: front_yaml_l.length + 2,
      hasDelimiters: true,
    }
  } else if (kv.guess && dataKeyRx.test(txt)) {
    let lines = txt.split(/\n/)
    let idx = 0
    let frontLines = []
    let body
    let broken = false
    while (idx < lines.length && !broken) {
      let line = lines[idx]
      if (dataKeyRx.test(line)) {
        frontLines.push(line)
      } else {
        if (/\s*/.test(line)) {
          let res: MarkdownRawParts_1 = {
            frontText: frontLines.join('\n'),
            frontRaw: frontLines.join('\n'),
            body: lines.slice(idx).join('\n'),
            bodyLineOffset: idx,
            hasDelimiters: false,
          }
          return res
        } else {
          broken = true
        }
      }

      idx++
    }

    let linesBody = lines.slice(idx)
    let t1 = linesBody.length ? linesBody.join('\n') : null
    let frontText = frontLines.join('\n')
    return { frontText, frontRaw: frontText, body: t1, bodyLineOffset: 0 }
  }

  return { frontText: null, frontRaw: null, body: txt, bodyLineOffset: 0 }
}

export async function extractFrontMatter(
  txt: string,
  kv: { guess? } = {},
): Promise<MarkdownRawParts_2> {
  let parts = extractFrontMatter_v1(txt, { guess: kv.guess })
  if (parts.error) {
    return toParts_v2({
      parts,
      txt: null,
      error: parts.error,
      doc: null,
      data: null,
      front: null,
    })
  }

  let data
  let error

  let front = parts.frontText
  let doc //: Document.Parsed

  if (front) {
    try {
      // let front = splitText(parts.frontText).onEachLine(line => {
      //   let rxBogusField = /^(\s*\w+):(\w)/
      //   let next = line.replace(rxBogusField, '$1: $2')
      //   // if (next !== line) {
      //   //   $dev('00')
      //   // }
      //   return next
      // })

      let YAML = await import('yaml')
      let out = YAML.parse(parts.frontText)
      let final: MarkdownRawParts_2 = {
        _raw: txt,
        ...parts,
        // _front: data,
        front_yaml: parts.frontText,
        frontText: parts.frontText,
        frontDataSafe() {
          if (error) {
            // NOTE will mess up dev print!
            throw error
          }
          return data
        },

        get frontData() {
          if (error) {
            // NOTE will mess up dev print!
            // throw error
          }
          return data
        },
        set frontData(obj) {
          data = obj
        },
        doc,
        error,

        async getData() {
          // TODO before:release dedup, dry this parse
          //  this should be the only way to get data
          //  this should be the only yaml parser???
          const { parseAllDocuments } = await import('yaml').then(
            x => x.default,
          )
          let all = parseAllDocuments(front)
          let doc = all[0]
          data = doc.toJSON()
          return data
        },

        [Symbol.for('nodejs.util.inspect.custom')]() {
          let str = [`chars:${txt?.length}`, data ? '+fm' : null].join(' ')
          return `<MarkdownParts ${str} >`
        },
      }
      return final

      let all //= parseAllDocuments(front)
      if (all.length !== 1) {
        // TODO before:release
        throw Error('yaml error')
      }

      doc = all[0]
      if (all.length > 1) {
        $dev('why two docs??')
      }
      data = doc.toJSON()
      // data = Yaml.load(front)

      if (typeof data === 'string') {
        error = CustomError.create('No YAML object', {
          name: 'YamlError',
          // data: { line, column, reason: e.reason },
        })
        data = undefined
      }

      if (doc.errors.length) {
        let cause = doc.errors[0]
        let data = {} as any
        if (cause.source) {
          let so = cause.source
          // (so.type === 'PLAIN')
          // @ ts-expect-error
          data.key = so?.resolved.value
          // @ ts-expect-error
          data.range = so?.resolved.range
        }
        error = CustomError.create('Could not parse YAML', {
          name: 'YamlError',
          cause: doc.errors[0],
          data,
          // data: { line, column, reason: e.reason, message: e.message },
        })
        // $dev({ ...doc.errors[0] })
      }
      // $dev({ data, parts })
      // attributes = {}
    } catch (e) {
      if (e.name !== 'YAMLException') {
        throw e
      }
      let { line, column, snippet } = e.mark
      line = line + 1
      // TODO real issue
      // let isu : Issue = {
      //   ruleId: 'yaml-error',
      //   message: e.reason,
      //   level: 'error',
      //   line,
      //   column,
      //   snippet,
      // }
      //

      let msg = 'Cannot parse YAML'
      error = CustomError.create(msg, {
        name: 'YamlError',
        data: { line, column, reason: e.reason, message: e.message },
      })

      // this.checks.checkRuleSync(
      //   InvalidYamlRule,
      //   {
      //     error: e,
      //     line,
      //     column,
      //     snippet,
      //   },
      //   {
      //     lineNumber: line,
      //   },
      // )
    }
  }

  if (doc) {
    doc[Symbol.for('nodejs.util.inspect.custom')] = function () {
      return `<YamlDoc >`
    }
  }

  // TODO:md-now
  let final: MarkdownRawParts_2 = {
    _raw: txt,
    ...parts,
    // _front: data,
    front_yaml: parts.frontText,
    frontText: parts.frontText,
    frontDataSafe() {
      if (error) {
        // NOTE will mess up dev print!
        throw error
      }
      return data
    },

    get frontData() {
      if (error) {
        // NOTE will mess up dev print!
        // throw error
      }
      return data
    },
    set frontData(obj) {
      data = obj
    },
    doc,
    error,

    async getData() {
      // TODO before:release dedup, dry this parse
      //  this should be the only way to get data
      //  this should be the only yaml parser???
      const { parseAllDocuments } = await import('yaml').then(x => x.default)
      let all = parseAllDocuments(front)

      let doc = all[0]
      if (!doc) return null

      data = doc.toJSON()
      return data
    },

    [Symbol.for('nodejs.util.inspect.custom')]() {
      let str = [`chars:${txt?.length}`, data ? '+fm' : null].join(' ')
      return `<MarkdownParts ${str} >`
    },
  }
  if (process.env.NODE_ENV === 'test') {
    Object.freeze(final)
  }

  return final
}
