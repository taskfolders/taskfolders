import { IssueSuite } from '../IssueSuite.js'

export abstract class BaseHandler {
  params: Record<string, unknown>
  abstract execute(): void | Promise<void>
}

export abstract class LintHandler extends BaseHandler {
  suite: IssueSuite
  setup?
  write?
  async testPath?(path: string): Promise<boolean>
}
