import ansiEscapes from 'ansi-escapes'
import { relative } from 'node:path'
import { assertNever } from '../../types/assertNever'

// cspell:word webstorm

class UserEditorLink {
  static fromSource(x) {
    let obj = new this()
    return obj
  }
  link() {
    return '-link-'
  }
}

class SourcePosition {
  file
  lineNumber
  columnNumber
}

// TODO:utils-dedup
export type ISourcePosition = Pick<
  SourcePosition,
  'file' | 'lineNumber' | 'columnNumber'
>

/**
 * TODO explore alternative url schemes
 *   see:5a00a5a6-e04c-4179-8cb5-e916c47bcc8d
 *
 */
export function shellHyperlink(
  kv: {
    text?: string
    source?: ISourcePosition

    template?: 'default' | 'file' | 'mscode' | 'vscode' | 'sublime' | 'webstorm'

    // must have one
    editor?: boolean
    link?: string
    path?: string
    cwd?: string
    lineNumber?: number | string
    scheme?
  } & (
    | {
        path: string
        cwd?: string
      }
    | {
        link: string
      }
    | {
        source: ISourcePosition
      }
  ),
) {
  if (process.env.SHELL_HYPERLINKS === '0') {
    return kv.text
  }
  function hyperlink_OLD(text: string, url: string, kv: { schema? } = {}) {
    if (!url.includes('://') && kv.schema !== null) {
      let schema = kv.schema ?? 'file'
      url = `${schema}://${url}`
    }
    return ansiEscapes.link(text, url)
  }

  // TODO #rf to util #dry
  let lineNumber
  if (typeof kv.lineNumber === 'number') {
    lineNumber = kv.lineNumber
  } else if (typeof kv.lineNumber === 'string') {
    lineNumber = parseInt(kv.lineNumber)
  }

  let source = kv.source || { file: kv.path, lineNumber }

  let filePath = source.file
  let text = kv.text || relative(kv.cwd ?? '', filePath)
  let link = kv.link

  if (kv.template) {
    let template = kv.template
    if (kv.template === 'default') {
      template = kv.template ?? process.env.TF_HYPERLINKS ?? ('file' as any)
    }

    switch (template) {
      case 'mscode': {
        let link = `mscode://${filePath}:${lineNumber}`
        return ansiEscapes.link(text, link)
      }
      case 'vscode': {
        // vscode://file/Users/username/Documents/myfile.txt?lineNumber=50
        let link = `vscode://file/${filePath}?lineNumber=${lineNumber}`
        return ansiEscapes.link(text, link)
      }
      case 'sublime': {
        // vscode://file/Users/username/Documents/myfile.txt?lineNumber=50
        let link = `sublime://file/${filePath}?lineNumber=${lineNumber}`
        return ansiEscapes.link(text, link)
      }
      case 'webstorm': {
        // webstorm://open/file/path/to/file/file.ext?lineNumber=50
        let link = `webstorm://open/${filePath}?lineNumber=${lineNumber}`
        return ansiEscapes.link(text, link)
      }

      case 'default': {
        throw Error('Default not defined')
      }
      default:
        assertNever(template)
    }
  }

  // TODO boo!!! clean this, scheme is set in hyperlink_OLD
  let scheme = kv.scheme ?? 'file'
  if (kv.scheme === null) {
    scheme = null
  }
  if ('path' in kv) {
    let prefix = scheme + '://'
    if (kv.scheme === null) {
      prefix = ''
    }

    // source = { file: kv.path }
    link = kv.editor
      ? UserEditorLink.fromSource(source).link()
      : prefix + source.file

    if (kv.lineNumber) {
      link += `:${kv.lineNumber}`
    }
  } else if ('link' in kv) {
    //
  } else if (!kv.source) {
    return text
  } else {
    let editor = UserEditorLink.fromSource(source)
    return hyperlink_OLD(text, editor.link())
  }

  return hyperlink_OLD(text, link, { schema: scheme })
}

export class ShellHyperlink {
  static singleton() {
    return single
  }

  static create = shellHyperlink
}
const single = new ShellHyperlink()
