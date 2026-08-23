// Lint markdown frontmatter against the TaskFolders data schema
//
// Extracts frontmatter from a markdown file and validates field names
// and types against frontmatter.schema.json.
//
// @uid 7f3a91c2-8b4e-4d1a-a6f0-3e5c8d2b9a47

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MarkdownDocument } from '@taskfolders/utils/markdown'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const schemaPath = path.resolve(
  __dirname,
  '../../../../../utils/src/markdown/task-folders/frontmatter.schema.json',
)

interface LintIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  field?: string
}

function loadSchema() {
  let raw = fs.readFileSync(schemaPath, 'utf-8')
  return JSON.parse(raw)
}

function validateType(value: unknown, prop: Record<string, any>): boolean {
  if (prop.oneOf) {
    return prop.oneOf.some(variant => validateType(value, variant))
  }
  if (prop.const !== undefined) {
    return value === prop.const
  }
  switch (prop.type) {
    case 'string':
      return typeof value === 'string'
    case 'boolean':
      return typeof value === 'boolean'
    case 'integer':
      return Number.isInteger(value)
    case 'number':
      return typeof value === 'number'
    case 'array':
      return Array.isArray(value)
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    default:
      return true
  }
}

export class LintFrontmatterHandler {
  filePath: string
  issues: LintIssue[] = []

  constructor(kv: { file: string }) {
    this.filePath = path.resolve(kv.file)
  }

  async execute() {
    let schema = loadSchema()
    let body = fs.readFileSync(this.filePath, 'utf-8')

    let md = MarkdownDocument.fromBody(body, { implicitFrontmatter: true })

    if (!md.data) {
      this.issues.push({
        severity: 'info',
        code: 'no-frontmatter',
        message: 'File has no frontmatter',
      })
      this.printResults()
      return this
    }

    let data: Record<string, any> = md.data as any

    // Check for unknown fields
    let knownFields = new Set(Object.keys(schema.properties))
    for (let key of Object.keys(data)) {
      if (!knownFields.has(key)) {
        this.issues.push({
          severity: 'warning',
          code: 'unknown-field',
          message: `Unknown field "${key}" — not in schema`,
          field: key,
        })
      }
    }

    // Type-check known fields
    for (let [key, value] of Object.entries(data)) {
      let prop = schema.properties[key]
      if (!prop) continue

      if (!validateType(value, prop)) {
        let expected = prop.type ?? prop.oneOf?.map(v => v.type).join(' | ')
        this.issues.push({
          severity: 'error',
          code: 'type-mismatch',
          message: `Field "${key}": expected ${expected}, got ${typeof value}`,
          field: key,
        })
      }
    }

    // Validate uid format
    if (data.uid && typeof data.uid === 'string') {
      let uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRx.test(data.uid)) {
        this.issues.push({
          severity: 'error',
          code: 'invalid-uid',
          message: `Field "uid": not a valid UUID`,
          field: 'uid',
        })
      }
    }

    // Validate sid format
    if (data.sid && typeof data.sid === 'string') {
      let sidRx = /^[a-z][a-z0-9-]*$/
      if (!sidRx.test(data.sid)) {
        this.issues.push({
          severity: 'warning',
          code: 'invalid-sid',
          message: `Field "sid": should be lowercase kebab-case`,
          field: 'sid',
        })
      }
    }

    // Validate date fields
    let dateFields = ['after', 'before', 'done']
    for (let field of dateFields) {
      if (data[field] && typeof data[field] === 'string') {
        let dateRx = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRx.test(data[field])) {
          this.issues.push({
            severity: 'warning',
            code: 'invalid-date',
            message: `Field "${field}": expected ISO 8601 date (YYYY-MM-DD)`,
            field,
          })
        }
      }
    }

    // Validate review subfields
    if (data.review && typeof data.review === 'object') {
      let reviewSchema = schema.properties.review
      let knownReviewFields = new Set(Object.keys(reviewSchema.properties))
      for (let key of Object.keys(data.review)) {
        if (!knownReviewFields.has(key)) {
          this.issues.push({
            severity: 'warning',
            code: 'unknown-field',
            message: `Unknown review subfield "${key}"`,
            field: `review.${key}`,
          })
        }
      }
    }

    this.printResults()
    return this
  }

  printResults() {
    let rel = path.relative(process.cwd(), this.filePath)
    if (this.issues.length === 0) {
      console.log(`✓ ${rel}`)
      return
    }

    console.log(`${rel}`)
    for (let issue of this.issues) {
      let icon = issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ'
      console.log(`  ${icon} ${issue.message} [${issue.code}]`)
    }
  }

  get hasErrors() {
    return this.issues.some(i => i.severity === 'error')
  }
}
