import fg from 'fast-glob'
import ts from 'typescript'
// import * as ts from 'typescript'
import * as fs from 'fs'
import { join } from 'node:path'
import * as Path from 'node:path'

import '../../../native/groupBy.polyfill'

// import { dirname } from 'path'
// import { fileURLToPath } from 'url'
import { getsert } from '../../../native/object/getsert'
import { when } from '../../../native/flow/when'
import { ScreenPrinter } from '../../../screen/ScreenPrinter'
import { shellHyperlink } from '../../../screen/shellHyperlink/shellHyperlink'

/* convert import path into exact file path
 * - add file extension
 * - add /index.ts
 */
export const importPathToFile = ({
  importPath,
  sourcePath,
}: {
  importPath: string
  sourcePath: string
}) => {
  if (!(importPath.startsWith('.') || importPath.startsWith('/'))) return null
  if (importPath.startsWith('.')) {
    importPath = join(sourcePath, '..', importPath)
  }

  if (fs.existsSync(importPath)) {
    let stat = fs.statSync(importPath)
    if (stat.isDirectory()) {
      let idx = Path.join(importPath, 'index.ts')
      if (fs.existsSync(idx)) {
        return idx
      }

      // idx = Path.join(importPath, 'index.mjs')
      // if (fs.existsSync(idx)) {
      //   return idx
      // }
    }
  }

  let maybe = importPath + '.ts'
  if (fs.existsSync(maybe)) return maybe

  maybe = importPath + '.js'
  if (fs.existsSync(maybe)) return maybe

  maybe = importPath.replace(/\.js$/, '.ts')
  if (fs.existsSync(maybe)) return maybe

  maybe = importPath.replace(/\.js$/, '.d.ts')
  if (fs.existsSync(maybe)) return maybe

  maybe = importPath + '.tsx'
  if (fs.existsSync(maybe)) return maybe

  let error = Error('Could not guess import file extension')
  error.data = {
    importPath,
    sourcePath,
  }
  throw error
  // return fullImport
}

interface ImportItem {
  path: string
  pathFull: string
  users: { path; lineNumber }[]
  count: number
  type?: 'library' | 'local-inside' | 'local-outside'
  importKeys: string[]
}

function setRelativePaths(allItems: ImportItem[], cwd: string) {
  allItems.forEach(item => {
    if (item.path.startsWith('/')) {
      let next = Path.relative(cwd, item.path)
      if (!next.startsWith('.')) {
        next = './' + next
      }
      item.path = next
    }

    // set type based on rel path
    let type
    if (!item.path.startsWith('.')) {
      type = 'library'
    } else if (item.path.startsWith('..')) {
      type = 'local-outside'
    } else {
      type = 'local-inside'
    }
    item.type = type

    // relative user paths
    item.users = item.users.map(x => {
      let next = Path.relative(cwd, x.path)
      next = './' + next
      return { path: next, lineNumber: x.lineNumber }
    })
  })
}

export class ExplainImports {
  cwd = process.cwd()
  screen = new ScreenPrinter()
  options = {
    showInside: false,
  }

  async execute() {
    let { cwd: dir } = this
    // log({ dir })
    let all = await fg(['**/*.(js|jsx|cjs|mjs|ts|tsx)'], {
      dot: false,
      cwd: dir,
    })

    // make full path
    all = all.map(x => join(dir, x))
    all = all.filter(x => !x.includes('.spec.'))

    let importItems: Record<string, ImportItem> = {}

    let files
    for (let sourceFilePath of all) {
      this.scanOneSourceFile(sourceFilePath, importItems)
    }

    let allItems = Object.values(importItems)

    setRelativePaths(allItems, this.cwd)
    // $dev(Object.values(importItems))

    // ..
    this.doPrint(allItems)
    return allItems
  }

  private scanOneSourceFile(
    sourceFilePath: string,
    importItems: Record<string, ImportItem>,
  ) {
    const sourceFile = ts.createSourceFile(
      sourceFilePath,
      fs.readFileSync(sourceFilePath).toString(),
      ts.ScriptTarget.Latest,
    )
    let fileNode = { tsSource: sourceFile, imports: [] }

    ts.forEachChild(sourceFile, node => {
      // const declaration = node as ts.Declaration
      if (ts.isImportDeclaration(node)) {
        let sp = node.moduleSpecifier

        let start = sp.getStart(sourceFile)
        let t1 = sourceFile.getLineAndCharacterOfPosition(start)
        let lineNumber = t1.line + 1

        let importKeys = []

        // null check for plain imports like `import 'style.css'`
        let names = node.importClause?.namedBindings
        if (names && ts.isNamedImports(names)) {
          importKeys = names.elements.map(x => x.name.escapedText)
        }
        // $dev(node.importClause.namedBindings.elements)
        if (ts.isStringLiteral(sp)) {
          let importPath = sp.text

          let fullImport = importPath

          // If relative path import, make full path
          if (importPath.startsWith('.')) {
            let importPath_f = join(sourceFilePath, '..', importPath)
            fullImport = importPath_f
            importPath = Path.relative(this.cwd, importPath_f)
            if (importPath === '') {
              importPath = '.'
            }
            if (!importPath.startsWith('.')) {
              // importPath = Path.join('./', importPath)
              importPath = './' + importPath
            }
          }

          fullImport = fullImport.replace(/\/index$/, '')

          let found = getsert(importItems, fullImport, () => {
            let item: ImportItem = {
              path: fullImport,
              pathFull: importPathToFile({
                importPath: fullImport,
                sourcePath: sourceFilePath,
              }),
              users: [],
              count: 0,
              importKeys,
            }

            return item
          })
          found.users.push({ path: sourceFilePath, lineNumber })
          found.count++
          fileNode.imports.push(found)
        } else {
          throw Error(`Unexpected kind ${node.kind}`)
        }
      }
    })

    return fileNode
  }

  doPrint(allItems: ImportItem[]) {
    let { screen } = this
    let th = screen.style

    const sortStyles = ['count', 'name'] as const
    let sort = 'name'
    {
      // TODO:print-options #concern
      let scr = screen
      scr = scr.log(th.section('options')).indent()
      // TODO #rf out print options
      let ops = sortStyles
        .map(x => {
          if (x === sort) return scr.style.color.green(x)
          return scr.style.dim(x)
        })
        .join(' ')
      scr.log(`Sort: ${ops}`)

      const show = ['on', 'off'] as const
      let showInside = this.options.showInside ? 'on' : 'off'
      let o2 = show
        .map(x => {
          if (x === showInside) return scr.style.color.green(x)
          return scr.style.dim(x)
        })
        .join(' ')
      scr.log(`Show inside: ${o2}`)

      const op1 = ['include-tests'] as const
      let line = op1.map(x => {
        if (this.options[x]) {
          scr.style.color.green(x)
        }
        return scr.style.dim(x)
      })
      scr.log(`Options: ${line}`)

      scr.log()
    }
    switch (sort) {
      case 'name':
        allItems.sort((lhs, rhs) => {
          if (lhs.path < rhs.path) return -1
          if (lhs.path > rhs.path) return 1
          return 0
        })

        break
      case 'count':
        // TODO sort outside print
        allItems.sort((lhs, rhs) => {
          return rhs.count - lhs.count
        })
        break
      default:
        throw Error('unknown sort')
    }

    let groups = Object.groupBy(allItems, x => x.type)

    let print = (items: ImportItem[], screen: ScreenPrinter) => {
      items.map(item => {
        let link = shellHyperlink({
          path: item.pathFull,
          scheme: 'mscode',
          // lineNumber: x.lineNumber,
          text: item.path,
        })

        screen.log(
          th =>
            `${link} (${item.count})  { ${th.dim(
              item.importKeys.join(', '),
            )} }`,
        )
        if (item.importKeys.length) {
          // screen.log(` `)
        }
        item.users.map(u => {
          // eslint-disable-next-line
          let text = `${u.path}:${u.lineNumber}`
          let link = shellHyperlink({
            path: Path.join(this.cwd, u.path),
            scheme: 'mscode',
            lineNumber: u.lineNumber,
            text,
          })
          screen.log(`  ${link}`).log()
        })
        // screen.log('')
      })
    }

    when(groups['local-outside'], x => {
      screen.log(th => th.section('Outside dependencies'))
      print(x, screen.indent())
      screen.log()
    })

    if (this.options.showInside) {
      when(groups['local-inside'], x => {
        screen.log('Inside')
        print(x, screen.indent())
        screen.log()
      })
    }

    when(groups['library'], items => {
      screen.log(th => th.section('Libraries'))
      items.map(x => {
        screen.log(`  ${x.path} (${x.count})`)
      })
    })
  }
}
