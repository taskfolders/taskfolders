import { extractFrontMatter } from './extractFrontMatter.js'
import YAML from 'yaml'

export class MarkdownDocument<T = unknown> {
  _inputBody: string
  data: T
  content: string

  constructor(data: T, content: string) {
    this.data = data
    this.content = content
  }

  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
    kv: { implicitFrontmatter?: boolean } = {},
  ): Promise<InstanceType<T>> {
    let fm = await extractFrontMatter(body, { guess: kv.implicitFrontmatter })

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
    let parts = [
      '---',
      YAML.stringify(this.data).trim(),
      '---',
      '',
      this.content,
    ]
    return parts.join('\n')
  }
}
