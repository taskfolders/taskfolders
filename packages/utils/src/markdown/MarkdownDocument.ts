import { extractFrontMatter } from './extractFrontMatter.js'
import YAML from 'yaml'
import { CustomError } from '../errors/CustomError.js'

const MarkdownError = CustomError.defineGroup('MarkdownError', {
  invalidFrontmatter: class extends CustomError {},
})

export class MarkdownDocument<T = unknown> {
  _inputBody: string
  path?: string
  data: T
  content: string

  constructor(data: T, content: string) {
    this.data = data
    this.content = content
  }

  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
    kv: { implicitFrontmatter?: boolean; unsafe?: boolean } = {},
  ): Promise<InstanceType<T>> {
    let fm = await extractFrontMatter(body, {
      guess: kv.implicitFrontmatter,
    }).catch(e => {
      let error = new Error('Unreadable frontmatter')
      // @ts-expect-error
      error.cause = e
      throw error
    })

    let data = (await fm.getData()) as T
    // if (process.env.NODE_ENV === 'test') {
    //   Object.freeze(data)
    // }
    let obj = new this(data, fm.body)
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
    let parts = ['---', YAML.stringify(this.data).trim(), '---']
    let lines = this.content.split('\n')
    if (lines[0] !== '') {
      parts.push('')
    }
    parts = parts.concat(lines)

    return parts.join('\n')
  }
}
