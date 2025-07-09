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

  static async fromBody<T extends {}>(
    // this: T,
    body: string,
    kv: { implicitFrontmatter?: boolean; unsafe?: boolean } = {},
    //): Promise<InstanceType<T>> {
  ): Promise<MarkdownDocument<T>> {
    let fm = await extractFrontMatter(body, {
      guess: kv.implicitFrontmatter,
    }).catch(e => {
      let error = new Error('Unreadable frontmatter')
      error.cause = e
      throw error
    })
    let data = (await fm.getData()) as T
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

    return obj as any
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
    let lines = this.content.split('\n')
    if (lines[0] !== '') {
      parts.push('')
    }
    parts = parts.concat(lines)

    return parts.join('\n')
  }
}
