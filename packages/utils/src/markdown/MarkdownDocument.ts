import { extractFrontMatter } from './extractFrontMatter.js'
import YAML from 'yaml'
import { CustomError } from '../errors/CustomError.js'

const MarkdownError = CustomError.defineGroup('MarkdownError', {
  invalidFrontmatter: class extends CustomError {},
})

export class MarkdownDocument<T = unknown> {
  _inputBody: string
  _frontMatter: { bodyLineOffset; delimiter }
  path?: string
  data: T
  content: string

  constructor(data: T, content: string) {
    this.data = data
    this.content = content
  }

  static fromBody<T extends object>(
    // this: T,
    body: string,
    kv: { implicitFrontmatter?: boolean; unsafe?: boolean } = {},
    //): Promise<InstanceType<T>> {
  ): MarkdownDocument<T> {
    let fm: ReturnType<typeof extractFrontMatter>
    try {
      fm = extractFrontMatter(body, {
        guess: kv.implicitFrontmatter,
      })
    } catch (e) {
      let error = new Error('Unreadable frontmatter')
      error.cause = e
      throw error
    }

    let data = fm.getData() as T
    // if (process.env.NODE_ENV === 'test') {
    //   Object.freeze(data)
    // }
    let obj = new this(data, fm.body)
    obj._frontMatter = {
      bodyLineOffset: fm.bodyLineOffset,
      delimiter: fm.hasDelimiters ? '---' : null,
    }

    // Object.defineProperty(obj, '_inputBody', {
    //   value: body,
    //   enumerable: false,
    //   writable: false,
    // })

    return obj
  }

  setData<T>(data: T): MarkdownDocument<T> {
    this.data = data as any
    return this as any
  }

  clone() {
    let obj = new MarkdownDocument(this.data, this.content)
    return obj
  }

  toString() {
    let delimiter = this._frontMatter.delimiter
    let parts = [delimiter, YAML.stringify(this.data).trim(), delimiter].filter(
      Boolean,
    )
    if (this.content) {
      let lines = this.content.split('\n')
      if (lines[0] !== '') {
        parts.push('')
      }
      parts = parts.concat(lines)
    }

    return parts.join('\n')
  }
}
