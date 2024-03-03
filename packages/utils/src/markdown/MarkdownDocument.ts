import { extractFrontMatter } from './extractFrontMatter.js'

export class MarkdownDocument<T = unknown> {
  data: T
  content: string

  constructor(data: T, content: string) {
    this.data = data
    this.content = content
  }

  static async fromBody<T extends typeof MarkdownDocument<any>>(
    this: T,
    body: string,
  ): Promise<InstanceType<T>> {
    let fm = await extractFrontMatter(body)

    let data = (await fm.getData()) as T
    // if (process.env.NODE_ENV === 'test') {
    //   Object.freeze(data)
    // }
    let obj = new this(data, fm.body)
    return obj as any
  }

  clone() {
    let obj = new MarkdownDocument(this.data, this.content)
    return obj
  }
}
