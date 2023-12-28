import { IssueItem } from '../IssueItem'

export const BasicIssue = IssueItem.define({ code: 'basic-1' })
export const DataIssue = IssueItem.define<{ fox }>({ code: 'typed-1' })
export const TestIssue = IssueItem.define<{ bar: number }, { delta: number }>({
  code: 'typed-1',
  test(t) {
    if (t.delta > 1) {
      return { bar: t.delta }
    }
  },
})
