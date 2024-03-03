import { extractFrontMatter } from './extractFrontMatter.js'

export class MarkdownDocument<T = unknown> {
  data: T
  content: string

  constructor(data: T, content: string) {
    this.data = data
    this.content = content
  }

  static async fromBody<T = unknown>(
    body: string,
  ): Promise<MarkdownDocument<T>> {
    let fm = await extractFrontMatter(body)

    let data = (await fm.getData()) as T
    // if (process.env.NODE_ENV === 'test') {
    //   Object.freeze(data)
    // }
    let obj = new this<T>(data, fm.body)
    return obj
  }
}
