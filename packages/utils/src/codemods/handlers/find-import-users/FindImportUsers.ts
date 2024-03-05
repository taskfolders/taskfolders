import * as ts from 'typescript'
import * as fs from 'fs'
import fg from 'fast-glob'
import * as Path from 'node:path'
import { parseJtsImports } from '../explain-imports/parseJtsImports.js'
import { applyDevInspect } from '../explain-imports/applyDevInspect.js'
import { JsonFile } from '../../../fs/JsonFile.js'
import { MemoryScreenPrinter } from '../../../screen/MemoryScreenPrinter.js'
import type { PackageJsonType } from '../../../vendors/npm/PackageJsonType.js'
import { $dev } from '../../../logger/index.js'

export function scanSourceImports(sourceFilePath: string) {
  let body = fs.readFileSync(sourceFilePath).toString()
  const sourceFile = ts.createSourceFile(
    sourceFilePath,
    body,
    ts.ScriptTarget.Latest,
  )

  let final = {
    path: sourceFilePath,
    tsSource: sourceFile,
  }
  // TODO
  applyDevInspect(final)

  return parseJtsImports(final)
}
export async function findSourceCodeFiles(dir: string) {
  let all = await fg(['**/*.(js|jsx|cjs|mjs|ts|tsx)'], {
    dot: false,
    cwd: dir,
  })
  return all.map(x => Path.join(dir, x))
}
function findPackages(dir: string) {
  let r1 = JSON.parse(
    fs.readFileSync(Path.join(dir, 'package.json')).toString(),
  ) as PackageJsonType

  let ws = r1.workspaces.map(x => {
    return Path.join(dir, x.replace(/\*$/, ''))
  }) as string[]

  let a1 = ws
    .map(x => {
      let all = fs.readdirSync(x)
      all = all.map(p => Path.join(x, p))
      all = all.filter(x => {
        let p = Path.join(x, 'package.json')
        return fs.existsSync(p)
      })
      return all
    })
    .flat()
  return a1
}

export class FindImportUsers {
  async execute() {
    let dir = process.env.TASKFOLDERS_ROOT

    let packageDirs = findPackages(dir)
    let screen = new MemoryScreenPrinter()
    screen.debug = true

    // THIS DEV
    // packageDirs = packageDirs.slice(0, 1)
    for (let dir of packageDirs) {
      let data = JsonFile.readUnsafe<PackageJsonType>([
        dir,
        'package.json',
      ]).data

      let pack = { dir, name: data.name }
      screen.log(th => th.section(pack.name))

      let files = await findSourceCodeFiles(Path.join(pack.dir, 'src'))
      let importUsers = []
      if (pack.name === '@taskfolders/core') {
        $dev('fix imports')
      }
      for (let path of files) {
        let node = await scanSourceImports(path)
        let found = node.imports.find(x =>
          x.pathImport.startsWith('@taskfolders/core/dependencies'),
        )
        if (found) {
          importUsers.push(path)
        }
      }
      // $dev(importUsers)
      // return { dir }
    }
  }
}
